const db = require('../config/db');

class TravelAllowance {
  static async findById(id) {
    try {
      const result = await db.query(
        `SELECT ta.*, u.full_name as user_name, u.role as user_role,
                au.full_name as approver_name
         FROM travel_allowances ta
         LEFT JOIN users u ON ta.user_id = u.id
         LEFT JOIN users au ON ta.approved_by = au.id
         WHERE ta.id = $1`,
        [id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async findByUserId(userId, startDate = null, endDate = null) {
    try {
      let query = `
        SELECT ta.*, u.full_name as user_name, u.role as user_role,
               au.full_name as approver_name
        FROM travel_allowances ta
        LEFT JOIN users u ON ta.user_id = u.id
        LEFT JOIN users au ON ta.approved_by = au.id
        WHERE ta.user_id = $1
      `;
      const params = [userId];

      if (startDate && endDate) {
        query += ` AND ta.date BETWEEN $2 AND $3`;
        params.push(startDate, endDate);
      }

      query += ` ORDER BY ta.date DESC`;
      
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
  
  static async findByTeamManager(managerId) {
    try {
      const result = await db.query(
        `SELECT ta.*, u.full_name as user_name, u.role as user_role,
                au.full_name as approver_name
         FROM travel_allowances ta
         JOIN users u ON ta.user_id = u.id
         LEFT JOIN users au ON ta.approved_by = au.id
         JOIN user_teams ut ON u.id = ut.team_member_id
         WHERE ut.manager_id = $1
         ORDER BY ta.date DESC`,
        [managerId]
      );
      
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
  
  static async create(allowanceData) {
    try {
      const { userId, date, fromCity, toCity, distance, travelMode, amount, remarks } = allowanceData;
      
      const result = await db.query(
        `INSERT INTO travel_allowances (user_id, date, from_city, to_city, distance, travel_mode, amount, status, remarks)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', $8)
         RETURNING id, user_id, date, from_city, to_city, distance, travel_mode, amount, status, remarks, created_at, updated_at`,
        [userId, date, fromCity, toCity, distance, travelMode, amount, remarks]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async update(id, allowanceData) {
    try {
      const { date, fromCity, toCity, distance, travelMode, amount, remarks } = allowanceData;
      
      const result = await db.query(
        `UPDATE travel_allowances
         SET date = $1, from_city = $2, to_city = $3, distance = $4, travel_mode = $5, amount = $6, remarks = $7
         WHERE id = $8
         RETURNING id, user_id, date, from_city, to_city, distance, travel_mode, amount, status, remarks, created_at, updated_at`,
        [date, fromCity, toCity, distance, travelMode, amount, remarks, id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async updateStatus(id, status, approverId) {
    try {
      const result = await db.query(
        `UPDATE travel_allowances
         SET status = $1, approved_by = $2
         WHERE id = $3
         RETURNING id, user_id, date, from_city, to_city, distance, travel_mode, amount, status, remarks, created_at, updated_at`,
        [status, approverId, id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async delete(id) {
    try {
      const result = await db.query(
        'DELETE FROM travel_allowances WHERE id = $1 RETURNING id',
        [id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async findPendingApprovals(managerId = null) {
    try {
      let query = `
        SELECT ta.*, u.full_name as user_name, u.role as user_role,
               u.headquarters, u.department,
               au.full_name as approver_name
        FROM travel_allowances ta
        JOIN users u ON ta.user_id = u.id
        LEFT JOIN users au ON ta.approved_by = au.id
        WHERE u.role NOT IN ('ADMIN', 'SUPER_ADMIN')
      `;
      const params = [];

      if (managerId) {
        query += ` AND EXISTS (
          SELECT 1 FROM user_teams ut 
          WHERE ut.team_member_id = u.id 
          AND ut.manager_id = $1
        ) AND ta.status = 'PENDING'`;
        params.push(managerId);
      }

      query += ' ORDER BY ta.date DESC';
      
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
  
  static async getTotalsByUser(userId, startDate, endDate) {
    try {
      const result = await db.query(
        `SELECT SUM(amount) as total_amount
         FROM travel_allowances
         WHERE user_id = $1 AND status = 'APPROVED'
         AND date BETWEEN $2 AND $3`,
        [userId, startDate, endDate]
      );
      
      return parseFloat(result.rows[0].total_amount || 0);
    } catch (error) {
      throw error;
    }
  }
  
  static async getTopRoutes(userId, limit = 5) {
    try {
      const query = userId ? 
        `SELECT from_city || ' to ' || to_city as route, COUNT(*) as count
         FROM travel_allowances
         WHERE user_id = $1 AND status = 'APPROVED'
         GROUP BY from_city, to_city
         ORDER BY count DESC
         LIMIT $2` :
        `SELECT from_city || ' to ' || to_city as route, COUNT(*) as count
         FROM travel_allowances
         WHERE status = 'APPROVED'
         GROUP BY from_city, to_city
         ORDER BY count DESC
         LIMIT $1`;
      
      const params = userId ? [userId, limit] : [limit];
      
      const result = await db.query(query, params);
      
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TravelAllowance;