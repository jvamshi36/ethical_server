const db = require('../config/db');

class City {
  static async findAll(filter = {}) {
    try {
      let query = 'SELECT * FROM cities';
      const params = [];
      
      const conditions = [];
      
      if (filter.headquarters) {
        conditions.push(`headquarters = $${params.length + 1}`);
        params.push(filter.headquarters);
      }
      
      if (filter.isActive !== undefined) {
        conditions.push(`is_active = $${params.length + 1}`);
        params.push(filter.isActive);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY name ASC';
      
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
  
  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT * FROM cities WHERE id = $1',
        [id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async create(cityData) {
    try {
      const { name, state, headquarters } = cityData;
      
      const result = await db.query(
        `INSERT INTO cities (name, state, headquarters, is_active)
         VALUES ($1, $2, $3, true)
         RETURNING *`,
        [name, state, headquarters]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async update(id, cityData) {
    try {
      const { name, state, headquarters, isActive } = cityData;
      
      const result = await db.query(
        `UPDATE cities 
         SET name = $1, state = $2, headquarters = $3, is_active = $4
         WHERE id = $5
         RETURNING *`,
        [name, state, headquarters, isActive, id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async delete(id) {
    try {
      const result = await db.query(
        'DELETE FROM cities WHERE id = $1 RETURNING id',
        [id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async getDistanceBetweenCities(fromCity, toCity) {
    try {
      // In a real application, this would query a distance table or call a distance calculation API
      // For demonstration, we're using a simplified approach
      
      // Get city coordinates (in a real app, these would be stored in the database)
      const result = await db.query(
        `SELECT id, name FROM cities WHERE name IN ($1, $2)`,
        [fromCity, toCity]
      );
      
      if (result.rows.length !== 2) {
        throw new Error('One or both cities not found');
      }
      
      // Generate a semi-random but consistent distance based on city IDs
      const cityIds = result.rows.map(city => city.id);
      const distance = (Math.abs(cityIds[0] - cityIds[1]) * 50) + 
                       Math.floor((cityIds[0] + cityIds[1]) % 100);
      
      return {
        fromCity,
        toCity,
        distance: Math.max(10, distance) // Ensure minimum distance
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = City;