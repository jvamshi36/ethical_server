module.exports = {
    // Server configuration
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // JWT configuration
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
    JWT_EXPIRATION: process.env.JWT_EXPIRATION || '15m',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret',
    REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
    
    // Rate limiting
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX: 100, // 100 requests per window
    
    // Default settings
    DEFAULT_DAILY_ALLOWANCE: 30,
  };