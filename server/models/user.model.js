const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT id, username, email, full_name, role, department, headquarters, reporting_manager_id, is_active, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );
      
      // Standardize is_active as boolean
      if (result.rows[0]) {
        result.rows[0].is_active = Boolean(result.rows[0].is_active);
      }
      
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
  
  static async findByEmail(email) {
    try {
      const result = await db.query(
        'SELECT id, username, email FROM users WHERE email = $1',
        [email]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT id, username, email, full_name, role, department, headquarters, 
        reporting_manager_id, is_active, created_at, updated_at 
        FROM users
      `;
      const queryParams = [];
      
      // Build query filters
      const conditions = [];
      
      if (filters.search) {
        queryParams.push(`%${filters.search}%`);
        conditions.push(`(username ILIKE $${queryParams.length} OR full_name ILIKE $${queryParams.length} OR email ILIKE $${queryParams.length})`);
      }
      
      if (filters.role) {
        queryParams.push(filters.role);
        conditions.push(`role = $${queryParams.length}`);
      }
      
      if (filters.department) {
        queryParams.push(filters.department);
        conditions.push(`department = $${queryParams.length}`);
      }
      
      if (filters.headquarters) {
        queryParams.push(filters.headquarters);
        conditions.push(`headquarters = $${queryParams.length}`);
      }
      
      if (filters.isActive !== undefined) {
        queryParams.push(filters.isActive);
        conditions.push(`is_active = $${queryParams.length}`);
      }
      
      // Add WHERE clause if any conditions exist
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      // Add ordering
      query += ' ORDER BY full_name ASC';
      
      const result = await db.query(query, queryParams);
      
      // Standardize is_active as boolean for all users
      const standardizedRows = result.rows.map(user => ({
        ...user,
        is_active: Boolean(user.is_active)
      }));
      
      return standardizedRows;
    } catch (error) {
      throw error;
    }
  }
  
  static async findByRoles(roles = []) {
    try {
      if (!Array.isArray(roles) || roles.length === 0) {
        return [];
      }
      
      const placeholders = roles.map((_, index) => `$${index + 1}`).join(',');
      const query = `
        SELECT id, username, full_name, role 
        FROM users 
        WHERE role IN (${placeholders}) AND is_active = true
        ORDER BY full_name ASC
      `;
      
      const result = await db.query(query, roles);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
  
  static async create(userData) {
    try {
      const { username, password, email, fullName, role, department, headquarters, reportingManagerId, isActive = true } = userData;
      
      const result = await db.query(
        `INSERT INTO users (username, password, email, full_name, role, department, headquarters, reporting_manager_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, username, email, full_name, role, department, headquarters, reporting_manager_id, is_active, created_at, updated_at`,
        [username, password, email, fullName, role, department, headquarters, reportingManagerId, isActive]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
 // Update in server/models/user.model.js

static async update(id, userData) {
  try {
    const { email, fullName, role, department, headquarters, reportingManagerId, isActive } = userData;
    
    // Add debugging log to see the exact value being used for reportingManagerId
    console.log('In User.update - reportingManagerId:', reportingManagerId, 'type:', typeof reportingManagerId);
    
    const result = await db.query(
      `UPDATE users 
       SET email = $1, full_name = $2, role = $3, department = $4, 
           headquarters = $5, reporting_manager_id = $6, is_active = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING id, username, email, full_name, role, department, headquarters, reporting_manager_id, is_active, created_at, updated_at`,
      [email, fullName, role, department, headquarters, reportingManagerId, isActive, id]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in User.update:', error);
    throw error;
  }
}

  static async updatePassword(id, password) {
    try {
      await db.query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
        [password, id]
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
        'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id',
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
         WHERE ut.manager_id = $1
         ORDER BY u.full_name ASC`,
        [managerId]
      );
      
      // Standardize is_active as boolean for all team members
      const standardizedRows = result.rows.map(user => ({
        ...user,
        is_active: Boolean(user.is_active)
      }));
      
      return standardizedRows;
    } catch (error) {
      throw error;
    }
  }
  
  static async addTeamMember(managerId, teamMemberId) {
    try {
      // First check if team member exists and is active
      const memberCheck = await db.query(
        'SELECT id FROM users WHERE id = $1 AND is_active = true',
        [teamMemberId]
      );
      
      if (memberCheck.rows.length === 0) {
        throw new Error('Team member not found or inactive');
      }
      
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
      // Query to get users with their manager and team members in a hierarchical structure
      const result = await db.query(
        `WITH RECURSIVE user_hierarchy AS (
          SELECT id, full_name, role, 1 AS level, ARRAY[]::integer[] AS path, id::text AS path_names
          FROM users
          WHERE reporting_manager_id IS NULL
          
          UNION ALL
          
          SELECT u.id, u.full_name, u.role, h.level + 1, h.path || u.id, 
                 h.path_names || '>' || u.full_name
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
  
  // Check if user exists by ID and return minimal info
  static async exists(id) {
    try {
      const result = await db.query(
        'SELECT id, username FROM users WHERE id = $1',
        [id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
  static async findByRolesAndHQ(roles = [], headquarters) {
    try {
      if (!Array.isArray(roles) || roles.length === 0) {
        return [];
      }
      
      const params = [...roles, headquarters];
      const rolePlaceholders = roles.map((_, index) => `$${index + 1}`).join(',');
      const query = `
        SELECT id, username, full_name as "fullName", role 
        FROM users 
        WHERE role IN (${rolePlaceholders}) 
        AND headquarters = $${roles.length + 1}
        AND is_active = true
        ORDER BY full_name ASC
      `;
      
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error("Error in findByRolesAndHQ:", error);
      return [];
    }
  }
  
  // Get user with their reporting manager info
  static async getUserWithManager(id) {
    try {
      const result = await db.query(
        `SELECT u.id, u.username, u.email, u.full_name, u.role, u.department, u.headquarters, 
                u.reporting_manager_id, u.is_active, u.created_at, u.updated_at,
                m.id as manager_id, m.full_name as manager_name, m.role as manager_role
         FROM users u
         LEFT JOIN users m ON u.reporting_manager_id = m.id
         WHERE u.id = $1`,
        [id]
      );
      
      // Standardize is_active as boolean
      if (result.rows[0]) {
        result.rows[0].is_active = Boolean(result.rows[0].is_active);
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;