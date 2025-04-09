// server/models/roleAllowance.model.js
const db = require('../config/db');

class RoleAllowance {
  // Find all role allowances
  static async findAll() {
    try {
      const result = await db.query(
        'SELECT * FROM role_allowances ORDER BY daily_amount DESC'
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
  
  // Find allowance by role
  static async findByRole(role) {
    try {
      const result = await db.query(
        'SELECT * FROM role_allowances WHERE role = $1',
        [role]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Update allowance amount for a role
  static async updateAmount(role, amount) {
    try {
      const result = await db.query(
        `UPDATE role_allowances
         SET daily_amount = $1, updated_at = NOW()
         WHERE role = $2
         RETURNING *`,
        [amount, role]
      );
      
      if (result.rows.length === 0) {
        // If no rows updated, insert a new record
        return this.create(role, amount);
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Create a new role allowance
  static async create(role, amount) {
    try {
      const result = await db.query(
        `INSERT INTO role_allowances (role, daily_amount)
         VALUES ($1, $2)
         RETURNING *`,
        [role, amount]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Get allowance amount for a specific user by checking their role
  static async getDailyAllowanceForUser(userId) {
    try {
      const result = await db.query(
        `SELECT ra.daily_amount
         FROM role_allowances ra
         JOIN users u ON ra.role = u.role
         WHERE u.id = $1`,
        [userId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0].daily_amount;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = RoleAllowance;