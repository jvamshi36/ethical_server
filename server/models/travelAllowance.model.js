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
      const { userId, date, fromCity, toCity, distance, travelMode, stationType, remarks } = allowanceData;
      
      // Validate required fields
      const requiredFields = {
        userId: 'User ID',
        date: 'Date',
        fromCity: 'From City',
        toCity: 'To City',
        distance: 'Distance',
        travelMode: 'Travel Mode',
        stationType: 'Station Type'
      };

      const missingFields = [];
      for (const [field, label] of Object.entries(requiredFields)) {
        if (allowanceData[field] === undefined || allowanceData[field] === null || allowanceData[field] === '') {
          missingFields.push(label);
        }
      }

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Get base allowance amount for user's role
      const roleAllowance = await db.query(
        `SELECT ra.daily_amount
         FROM role_allowances ra
         JOIN users u ON ra.role = u.role
         WHERE u.id = $1`,
        [userId]
      );
      
      if (!roleAllowance.rows.length) {
        throw new Error('No role allowance found for user');
      }
      
      const baseAmount = roleAllowance.rows[0].daily_amount;
      
      // Use StationTypeAllowance class to calculate adjusted amount
      const StationTypeAllowance = require('./stationTypeAllowance.model');
      const amount = await StationTypeAllowance.calculateAdjustedAllowance(baseAmount, stationType);
      
      const result = await db.query(
        `INSERT INTO travel_allowances (user_id, date, from_city, to_city, distance, travel_mode, station_type, amount, status, remarks)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING', $9)
         RETURNING id, user_id, date, from_city, to_city, distance, travel_mode, station_type, amount, status, remarks, created_at, updated_at`,
        [userId, date, fromCity, toCity, distance, travelMode, stationType, amount, remarks || '']
      );
      
      return result.rows[0];
    } catch (error) {
      if (error.message.includes('station type')) {
        throw new Error(`Invalid station type: ${stationType}`);
      }
      throw error;
    }
  }
  
  static async update(id, allowanceData) {
    try {
      const { date, fromCity, toCity, distance, travelMode, stationType, remarks } = allowanceData;
      
      // Get user_id from existing record
      const existingRecord = await db.query('SELECT user_id FROM travel_allowances WHERE id = $1', [id]);
      if (!existingRecord.rows.length) {
        throw new Error('Travel allowance not found');
      }
      const userId = existingRecord.rows[0].user_id;

      // Get base allowance amount for user's role
      const roleAllowance = await db.query(
        `SELECT ra.daily_amount
         FROM role_allowances ra
         JOIN users u ON ra.role = u.role
         WHERE u.id = $1`,
        [userId]
      );
      
      if (!roleAllowance.rows.length) {
        throw new Error('No role allowance found for user');
      }
      
      const baseAmount = roleAllowance.rows[0].daily_amount;
      
      // Get station type multiplier
      const stationTypeResult = await db.query(
        'SELECT multiplier FROM station_type_allowances WHERE station_type = $1',
        [stationType]
      );
      
      if (!stationTypeResult.rows.length) {
        throw new Error(`Invalid station type: ${stationType}`);
      }
      
      // Calculate final amount
      const amount = baseAmount * stationTypeResult.rows[0].multiplier;
      
      const result = await db.query(
        `UPDATE travel_allowances
         SET date = $1, from_city = $2, to_city = $3, distance = $4, travel_mode = $5, station_type = $6, amount = $7, remarks = $8
         WHERE id = $9
         RETURNING id, user_id, date, from_city, to_city, distance, travel_mode, station_type, amount, status, remarks, created_at, updated_at`,
        [date, fromCity, toCity, distance, travelMode, stationType, amount, remarks, id]
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
  // Add this method to the TravelAllowance model class

// Find all travel allowances (for admin)
static async findAll(filters = {}) {
  try {
    let query = `
      SELECT ta.*, u.full_name as user_name, u.role as user_role,
             au.full_name as approver_name,
             u.department, u.headquarters
      FROM travel_allowances ta
      JOIN users u ON ta.user_id = u.id
      LEFT JOIN users au ON ta.approved_by = au.id
    `;
    
    const conditions = [];
    const params = [];
    
    // Add filters if provided
    if (filters.startDate && filters.endDate) {
      conditions.push(`ta.date BETWEEN $${params.length + 1} AND $${params.length + 2}`);
      params.push(filters.startDate, filters.endDate);
    }
    
    if (filters.status) {
      conditions.push(`ta.status = $${params.length + 1}`);
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
    query += ' ORDER BY ta.date DESC';
    
    const result = await db.query(query, params);
    return result.rows;
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