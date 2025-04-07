const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const routes = require('./routes/index');
const errorHandler = require('./middleware/error.middleware');
const config = require('./config/config');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW,
  max: config.RATE_LIMIT_MAX
});
app.use('/api/', limiter);

// API routes
app.use('/api', routes);

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'Server is running' });});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;