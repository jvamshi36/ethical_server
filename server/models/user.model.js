const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT id, username, email, full_name, role, department, headquarters, reporting_manager_id, is_active, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async findByUsername(username) {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async findAll(filters = {}) {
    try {
      let query = 'SELECT id, username, email, full_name, role, department, headquarters, reporting_manager_id, is_active, created_at, updated_at FROM users';
      const queryParams = [];
      
      // Build query filters
      const conditions = [];
      
      if (filters.search) {
        conditions.push(`(username ILIKE $${queryParams.length + 1} OR full_name ILIKE $${queryParams.length + 1} OR email ILIKE $${queryParams.length + 1})`);
        queryParams.push(`%${filters.search}%`);
      }
      
      if (filters.role) {
        conditions.push(`role = $${queryParams.length + 1}`);
        queryParams.push(filters.role);
      }
      
      if (filters.department) {
        conditions.push(`department = $${queryParams.length + 1}`);
        queryParams.push(filters.department);
      }
      
      if (filters.headquarters) {
        conditions.push(`headquarters = $${queryParams.length + 1}`);
        queryParams.push(filters.headquarters);
      }
      
      if (filters.isActive !== undefined) {
        conditions.push(`is_active = $${queryParams.length + 1}`);
        queryParams.push(filters.isActive);
      }
      
      // Add WHERE clause if any conditions exist
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      // Add ordering
      query += ' ORDER BY full_name ASC';
      
      const result = await db.query(query, queryParams);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
  
  static async create(userData) {
    try {
      const { username, password, email, fullName, role, department, headquarters, reportingManagerId } = userData;
      
      // Validate reporting manager based on role
      if (reportingManagerId) {
        const manager = await this.findById(reportingManagerId);
        if (!manager) {
          throw new Error('Invalid reporting manager');
        }

        // Check if the reporting manager has the correct role
        const validManagerRoles = {
          'BE': ['ABM', 'RBM'],
          'BM': ['ABM', 'RBM'],
          'SBM': ['ABM', 'RBM'],
          'ABM': ['DGM', 'ZBM'],
          'RBM': ['DGM', 'ZBM']
        };

        if (validManagerRoles[role] && !validManagerRoles[role].includes(manager.role)) {
          throw new Error(`Invalid reporting manager role. ${role} must report to ${validManagerRoles[role].join(' or ')}`);
        }
      } else if (!['DGM', 'ZBM'].includes(role)) {
        throw new Error('Reporting manager is required for this role');
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await db.query(
        `INSERT INTO users (username, password, email, full_name, role, department, headquarters, reporting_manager_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
         RETURNING id, username, email, full_name, role, department, headquarters, reporting_manager_id, is_active, created_at, updated_at`,
        [username, hashedPassword, email, fullName, role, department, headquarters, reportingManagerId || null]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async update(id, userData) {
    try {
      const { username, email, fullName, role, department, headquarters, reportingManagerId, isActive } = userData;
      
      const result = await db.query(
        `UPDATE users 
         SET email = $1, full_name = $2, role = $3, department = $4, 
             headquarters = $5, reporting_manager_id = $6, is_active = $7
         WHERE id = $8
         RETURNING id, username, email, full_name, role, department, headquarters, reporting_manager_id, is_active, created_at, updated_at`,
        [email, fullName, role, department, headquarters, reportingManagerId || null, isActive, id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async updatePassword(id, newPassword) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await db.query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [hashedPassword, id]
      );
      
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  static async delete(id) {
    try {
      // Soft delete by setting is_active to false
      const result = await db.query(
        'UPDATE users SET is_active = false WHERE id = $1 RETURNING id',
        [id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async getTeamMembers(managerId) {
    try {
      const result = await db.query(
        `SELECT u.id, u.username, u.email, u.full_name, u.role, u.department, u.headquarters, 
                u.reporting_manager_id, u.is_active, u.created_at, u.updated_at
         FROM users u
         JOIN user_teams ut ON u.id = ut.team_member_id
         WHERE ut.manager_id = $1`,
        [managerId]
      );
      
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
  
  static async addTeamMember(managerId, teamMemberId) {
    try {
      await db.query(
        'INSERT INTO user_teams (manager_id, team_member_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [managerId, teamMemberId]
      );
      
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  static async removeTeamMember(managerId, teamMemberId) {
    try {
      await db.query(
        'DELETE FROM user_teams WHERE manager_id = $1 AND team_member_id = $2',
        [managerId, teamMemberId]
      );
      
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  static async getUserHierarchy() {
    try {
      // Query to get users with their manager and team members
      const result = await db.query(
        `WITH RECURSIVE user_hierarchy AS (
          SELECT id, full_name, role, 1 AS level, ARRAY[]::integer[] AS path
          FROM users
          WHERE reporting_manager_id IS NULL
          
          UNION ALL
          
          SELECT u.id, u.full_name, u.role, h.level + 1, h.path || u.id
          FROM users u
          JOIN user_hierarchy h ON u.reporting_manager_id = h.id
        )
        SELECT * FROM user_hierarchy
        ORDER BY path, level`
      );
      
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;