const db = require('../config/db');

class Headquarters {
  static async findAll() {
    try {
      const result = await db.query(
        'SELECT * FROM headquarters ORDER BY name ASC'
      );
      
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
  
  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT * FROM headquarters WHERE id = $1',
        [id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async create(data) {
    try {
      const { name, location, address } = data;
      
      const result = await db.query(
        `INSERT INTO headquarters (name, location, address, is_active)
         VALUES ($1, $2, $3, true)
         RETURNING *`,
        [name, location, address]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async update(id, data) {
    try {
      const { name, location, address, isActive } = data;
      
      const result = await db.query(
        `UPDATE headquarters 
         SET name = $1, location = $2, address = $3, is_active = $4
         WHERE id = $5
         RETURNING *`,
        [name, location, address, isActive, id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async delete(id) {
    try {
      const result = await db.query(
        'DELETE FROM headquarters WHERE id = $1 RETURNING id',
        [id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Headquarters;