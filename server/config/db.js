const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Determine connection parameters
let connectionConfig;

// If DATABASE_URL is provided, use it
if (process.env.DATABASE_URL) {
  connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false
  };
} else {
  // Otherwise use individual connection parameters
  // Ensure password is explicitly converted to string to avoid SASL authentication issues
  connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'ethical',
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || '1234'), // Explicitly convert to string
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false
  };
}

// Create connection pool
const pool = new Pool(connectionConfig);

// Test database connection
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    console.log('Current connection config:', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'ethical',
      user: process.env.DB_USER || 'postgres',
      // Not logging password for security reasons
    });
  } else {
    console.log('Connected to PostgreSQL database');
    done();
  }
});

// Query helper function
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };