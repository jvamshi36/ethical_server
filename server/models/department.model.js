// Save this file as: server/models/department.model.js
const db = require('../config/db');

class Department {
  static async findAll() {
    try {
      const result = await db.query(
        'SELECT * FROM departments ORDER BY name ASC'
      );
      
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
  
  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT * FROM departments WHERE id = $1',
        [id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async create(data) {
    try {
      const { name, description } = data;
      
      const result = await db.query(
        `INSERT INTO departments (name, description, is_active)
         VALUES ($1, $2, true)
         RETURNING *`,
        [name, description]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async update(id, data) {
    try {
      const { name, description, isActive } = data;
      
      const result = await db.query(
        `UPDATE departments 
         SET name = $1, description = $2, is_active = $3
         WHERE id = $4
         RETURNING *`,
        [name, description, isActive, id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async delete(id) {
    try {
      const result = await db.query(
        'DELETE FROM departments WHERE id = $1 RETURNING id',
        [id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Department;