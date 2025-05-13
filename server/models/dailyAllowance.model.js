const db = require('../config/db');

class DailyAllowance {
  static async findById(id) {
    try {
      const result = await db.query(
        `SELECT da.*, u.full_name as user_name, u.role as user_role,
                au.full_name as approver_name
         FROM daily_allowances da
         LEFT JOIN users u ON da.user_id = u.id
         LEFT JOIN users au ON da.approved_by = au.id
         WHERE da.id = $1`,
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
        SELECT da.*, u.full_name as user_name, u.role as user_role,
               au.full_name as approver_name
        FROM daily_allowances da
        LEFT JOIN users u ON da.user_id = u.id
        LEFT JOIN users au ON da.approved_by = au.id
        WHERE da.user_id = $1
      `;
      const params = [userId];

      if (startDate && endDate) {
        query += ` AND da.date BETWEEN $2 AND $3`;
        params.push(startDate, endDate);
      }

      query += ` ORDER BY da.date DESC`;
      
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
  
  static async findByTeamManager(managerId) {
    try {
      const result = await db.query(
        `SELECT da.*, u.full_name as user_name, u.role as user_role,
                au.full_name as approver_name
         FROM daily_allowances da
         JOIN users u ON da.user_id = u.id
         LEFT JOIN users au ON da.approved_by = au.id
         JOIN user_teams ut ON u.id = ut.team_member_id
         WHERE ut.manager_id = $1
         ORDER BY da.date DESC`,
        [managerId]
      );
      
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Add this method to server/models/dailyAllowance.model.js

static async findExistingAllowance(userId, date, source = null) {
  try {
    let query = `SELECT * FROM daily_allowances 
       WHERE user_id = $1 AND date = $2`;
    const params = [userId, date];
    
    // If source is specified, filter by source
    if (source) {
      query += ` AND source = $3`;
      params.push(source);
    }
    
    const result = await db.query(query, params);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}
  
  static async create(allowanceData) {
    try {
      const { userId, date, amount, remarks, source = 'SCHEDULER' } = allowanceData;
      
      const result = await db.query(
        `INSERT INTO daily_allowances (user_id, date, amount, status, remarks, source)
         VALUES ($1, $2, $3, 'PENDING', $4, $5)
         RETURNING id, user_id, date, amount, status, remarks, source, created_at, updated_at`,
        [userId, date, amount, remarks, source]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async update(id, allowanceData) {
    try {
      const { date, amount, remarks } = allowanceData;
      
      const result = await db.query(
        `UPDATE daily_allowances
         SET date = $1, amount = $2, remarks = $3
         WHERE id = $4
         RETURNING id, user_id, date, amount, status, remarks, created_at, updated_at`,
        [date, amount, remarks, id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async updateStatus(id, status, approverId) {
    try {
      const result = await db.query(
        `UPDATE daily_allowances
         SET status = $1, approved_by = $2
         WHERE id = $3
         RETURNING id, user_id, date, amount, status, remarks, created_at, updated_at`,
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
        'DELETE FROM daily_allowances WHERE id = $1 RETURNING id',
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
        SELECT da.*, u.full_name as user_name, u.role as user_role,
               u.headquarters, u.department,
               au.full_name as approver_name
        FROM daily_allowances da
        JOIN users u ON da.user_id = u.id
        LEFT JOIN users au ON da.approved_by = au.id
        WHERE u.role NOT IN ('ADMIN', 'SUPER_ADMIN')
      `;
      const params = [];

      if (managerId) {
        query += ` AND EXISTS (
          SELECT 1 FROM user_teams ut 
          WHERE ut.team_member_id = u.id 
          AND ut.manager_id = $1
        ) AND da.status = 'PENDING'`;
        params.push(managerId);
      }

      query += ' ORDER BY da.date DESC';
      
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
  // Add this method to the DailyAllowance model class

// Find all daily allowances (for admin)
static async findAll(filters = {}) {
  try {
    let query = `
      SELECT da.*, u.full_name as user_name, u.role as user_role,
             au.full_name as approver_name,
             u.department, u.headquarters
      FROM daily_allowances da
      JOIN users u ON da.user_id = u.id
      LEFT JOIN users au ON da.approved_by = au.id
    `;
    
    const conditions = [];
    const params = [];
    
    // Add filters if provided
    if (filters.startDate && filters.endDate) {
      conditions.push(`da.date BETWEEN $${params.length + 1} AND $${params.length + 2}`);
      params.push(filters.startDate, filters.endDate);
    }
    
    if (filters.status) {
      conditions.push(`da.status = $${params.length + 1}`);
      params.push(filters.status);
    }
    
    if (filters.headquarters) {
      conditions.push(`u.headquarters = $${params.length + 1}`);
      params.push(filters.headquarters);
    }
    
    if (filters.department) {
      conditions.push(`u.department = $${params.length + 1}`);
      params.push(filters.department);
    }
    
    // Exclude admin and super admin users
    conditions.push(`u.role NOT IN ('ADMIN', 'SUPER_ADMIN')`);
    
    // Add conditions to query
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Add order
    query += ' ORDER BY da.date DESC';
    
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
         FROM daily_allowances
         WHERE user_id = $1 AND status = 'APPROVED'
         AND date BETWEEN $2 AND $3`,
        [userId, startDate, endDate]
      );
      
      return parseFloat(result.rows[0].total_amount || 0);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DailyAllowance;