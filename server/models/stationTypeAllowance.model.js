const db = require('../config/db');

class StationTypeAllowance {
  // Find all station type allowances
  static async findAll() {
    try {
      const result = await db.query(
        'SELECT * FROM station_type_allowances ORDER BY station_type'
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
  
  // Find allowance by station type
  static async findByType(stationType) {
    try {
      const result = await db.query(
        'SELECT * FROM station_type_allowances WHERE station_type = $1',
        [stationType]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Update multiplier for a station type
  static async updateMultiplier(stationType, multiplier) {
    try {
      const result = await db.query(
        `UPDATE station_type_allowances
         SET multiplier = $1
         WHERE station_type = $2
         RETURNING *`,
        [multiplier, stationType]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Calculate adjusted daily allowance based on station type
  static async calculateAdjustedAllowance(baseAmount, stationType) {
    try {
      const result = await db.query(
        'SELECT multiplier FROM station_type_allowances WHERE station_type = $1',
        [stationType]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`Invalid station type: ${stationType}`);
      }
      
      const { multiplier } = result.rows[0];
      return baseAmount * multiplier;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = StationTypeAllowance;