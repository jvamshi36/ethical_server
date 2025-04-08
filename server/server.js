// server/server.js 

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const routes = require('./routes/index');
const errorHandler = require('./middleware/error.middleware');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: '*', // Be more specific in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.path}`);
  console.log('Request Body:', req.body);
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
});
app.use('/api/', limiter);

// API routes
app.use('/api', routes);

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Catch-all route for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found', 
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;