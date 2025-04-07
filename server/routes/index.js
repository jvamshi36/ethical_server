const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const dailyAllowanceRoutes = require('./dailyAllowance.routes');
const travelAllowanceRoutes = require('./travelAllowance.routes');
const cityRoutes = require('./city.routes');
const analyticsRoutes = require('./analytics.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/da', dailyAllowanceRoutes);
router.use('/ta', travelAllowanceRoutes);
router.use('/cities', cityRoutes);
router.use('/analytics', analyticsRoutes);

// Export the router
module.exports = router;