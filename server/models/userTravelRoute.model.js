const db = require('../config/db');

class UserTravelRoute {
  // Find all routes for a specific user
  static async findByUserId(userId) {
    try {
      const result = await db.query(
        `SELECT * FROM user_travel_routes 
         WHERE user_id = $1 AND is_active = true
         ORDER BY from_city, to_city`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
  
  // Find a specific route by ID
  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT * FROM user_travel_routes WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Find a route by user, from city, and to city
  static async findByRoute(userId, fromCity, toCity) {
    try {
      const result = await db.query(
        `SELECT * FROM user_travel_routes 
         WHERE user_id = $1 AND from_city = $2 AND to_city = $3 AND is_active = true`,
        [userId, fromCity, toCity]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Create a new travel route for a user
  static async create(routeData) {
    try {
      const { userId, fromCity, toCity, distance, amount } = routeData;
      
      const result = await db.query(
        `INSERT INTO user_travel_routes (user_id, from_city, to_city, distance, amount, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING *`,
        [userId, fromCity, toCity, distance, amount]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Update an existing travel route
  static async update(id, routeData) {
    try {
      const { fromCity, toCity, distance, amount, isActive } = routeData;
      
      const result = await db.query(
        `UPDATE user_travel_routes
         SET from_city = $1, to_city = $2, distance = $3, amount = $4, is_active = $5, updated_at = NOW()
         WHERE id = $6
         RETURNING *`,
        [fromCity, toCity, distance, amount, isActive, id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Delete a travel route (soft delete by setting is_active to false)
  static async delete(id) {
    try {
      const result = await db.query(
        `UPDATE user_travel_routes
         SET is_active = false, updated_at = NOW()
         WHERE id = $1
         RETURNING id`,
        [id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Bulk insert travel routes for a user
  static async bulkCreate(userId, routes) {
    try {
      const client = await db.connect();
      
      try {
        await client.query('BEGIN');
        
        const insertPromises = routes.map(route => {
          const { fromCity, toCity, distance, amount } = route;
          return client.query(
            `INSERT INTO user_travel_routes (user_id, from_city, to_city, distance, amount, is_active)
             VALUES ($1, $2, $3, $4, $5, true)
             ON CONFLICT (user_id, from_city, to_city) 
             DO UPDATE SET distance = $4, amount = $5, is_active = true, updated_at = NOW()
             RETURNING *`,
            [userId, fromCity, toCity, distance, amount]
          );
        });
        
        const results = await Promise.all(insertPromises);
        await client.query('COMMIT');
        
        return results.map(result => result.rows[0]);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      throw error;
    }
  }

  // Add these functions to server/models/userTravelRoute.model.js

/**
 * Find all active travel routes for a specific user
 */
static async findActiveByUserId(userId) {
    try {
      const result = await db.query(
        `SELECT * FROM user_travel_routes 
         WHERE user_id = $1 AND is_active = true
         ORDER BY from_city, to_city`,
        [userId]
      );
      
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Check if a user has a specific route
   */
  static async hasRoute(userId, fromCity, toCity) {
    try {
      const result = await db.query(
        `SELECT EXISTS(
           SELECT 1 FROM user_travel_routes 
           WHERE user_id = $1 AND from_city = $2 AND to_city = $3 AND is_active = true
         ) as has_route`,
        [userId, fromCity, toCity]
      );
      
      return result.rows[0]?.has_route || false;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Import routes for a new user from a template user or common routes
   */
  static async importRoutesForUser(userId, templateUserId = null) {
    try {
      let result;
      
      if (templateUserId) {
        // Copy routes from template user
        result = await db.query(
          `INSERT INTO user_travel_routes 
           (user_id, from_city, to_city, distance, amount, is_active)
           SELECT $1, from_city, to_city, distance, amount, true
           FROM user_travel_routes
           WHERE user_id = $2 AND is_active = true
           RETURNING *`,
          [userId, templateUserId]
        );
      } else {
        // If no template user provided, use common routes
        // This would typically be defined by the organization
        result = await db.query(
          `INSERT INTO user_travel_routes 
           (user_id, from_city, to_city, distance, amount, is_active)
           SELECT $1, name as from_city, 
                  (SELECT name FROM cities WHERE id != c.id ORDER BY RANDOM() LIMIT 1) as to_city,
                  ROUND(RANDOM() * 100 + 20, 2) as distance,
                  ROUND(RANDOM() * 100 + 50, 2) as amount,
                  true as is_active
           FROM cities c
           WHERE is_active = true
           LIMIT 10
           RETURNING *`,
          [userId]
        );
      }
      
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserTravelRoute;