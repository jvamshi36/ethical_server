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
  
  static async findByUserId(userId) {
    try {
      const result = await db.query(
        `SELECT da.*, u.full_name as user_name, u.role as user_role,
                au.full_name as approver_name
         FROM daily_allowances da
         LEFT JOIN users u ON da.user_id = u.id
         LEFT JOIN users au ON da.approved_by = au.id
         WHERE da.user_id = $1
         ORDER BY da.date DESC`,
        [userId]
      );
      
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
  
  static async create(allowanceData) {
    try {
      const { userId, date, amount, remarks } = allowanceData;
      
      const result = await db.query(
        `INSERT INTO daily_allowances (user_id, date, amount, status, remarks)
         VALUES ($1, $2, $3, 'PENDING', $4)
         RETURNING id, user_id, date, amount, status, remarks, created_at, updated_at`,
        [userId, date, amount, remarks]
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
  
  static async findPendingApprovals(managerId) {
    try {
      const result = await db.query(
        `SELECT COUNT(*) as count
         FROM daily_allowances da
         JOIN users u ON da.user_id = u.id
         JOIN user_teams ut ON u.id = ut.team_member_id
         WHERE ut.manager_id = $1 AND da.status = 'PENDING'`,
        [managerId]
      );
      
      return parseInt(result.rows[0].count);
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