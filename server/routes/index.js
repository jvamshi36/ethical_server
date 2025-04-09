// server/routes/index.js
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const dailyAllowanceRoutes = require('./dailyAllowance.routes');
const travelAllowanceRoutes = require('./travelAllowance.routes');
const cityRoutes = require('./city.routes');
const analyticsRoutes = require('./analytics.routes');
const departmentRoutes = require('./department.routes');
const headquartersRoutes = require('./headquarters.routes');
const referenceRoutes = require('./reference.routes');
const roleAllowanceRoutes = require('./roleAllowance.routes');
const userTravelRouteRoutes = require('./userTravelRoute.routes');

// Mount routes with full controller implementations
router.use('/auth', authRoutes);
router.use('/users', userRoutes);  // Ensure this matches the frontend API call
router.use('/da', dailyAllowanceRoutes);
router.use('/ta', travelAllowanceRoutes);
router.use('/cities', cityRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/departments', departmentRoutes);
router.use('/headquarters', headquartersRoutes);
router.use('/reference', referenceRoutes);
router.use('/role-allowances', roleAllowanceRoutes);
router.use('/travel-routes', userTravelRouteRoutes);

// Add a catch-all route to help diagnose routing issues
router.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found', 
    path: req.path,
    method: req.method
  });
});

// Export the router
module.exports = router;