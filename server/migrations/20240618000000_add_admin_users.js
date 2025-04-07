const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

async function seedAdminUsers() {
  try {
    // Check if admin user already exists
    const checkResult = await pool.query(
      "SELECT * FROM users WHERE username = 'admin1'"
    );
    
    if (checkResult.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user
    const adminPassword = 'admin123'; // Change this to a secure password
    const adminHashedPassword = await bcrypt.hash(adminPassword, 10);
    
    await pool.query(
      `INSERT INTO users (username, password, email, full_name, role, department, headquarters, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      ['admin2', adminHashedPassword, 'admin2@example.com', 'System Admin', 'ADMIN', 'Administration', 'Head Office', true]
    );
    
    // Create super_admin user
    const superAdminPassword = 'superadmin123'; // Change this to a secure password
    const superAdminHashedPassword = await bcrypt.hash(superAdminPassword, 10);
    
    await pool.query(
      `INSERT INTO users (username, password, email, full_name, role, department, headquarters, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      ['superadmin', superAdminHashedPassword, 'superadmin@example.com', 'Super Admin', 'SUPER_ADMIN', 'Administration', 'Head Office', true]
    );
    
    console.log('Admin users created successfully');
  } catch (error) {
    console.error('Error seeding admin users:', error);
  }
}

// Run the seed function
seedAdminUsers()
  .then(() => {
    console.log('Seed complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });