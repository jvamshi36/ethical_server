const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Dashboard analytics data
router.get('/dashboard', analyticsController.getDashboardData);

// User analytics
router.get('/user', analyticsController.getUserAnalytics);

// Team analytics (for managers)
router.get('/team', analyticsController.getTeamAnalytics);

// Admin analytics
router.get('/admin', analyticsController.getAdminAnalytics);

// Export analytics data
router.get('/export', analyticsController.exportData);

// Test route for checking if analytics routes are working
router.get('/', (req, res) => {
  res.json({ message: 'Analytics routes are working' });
});

// Export the router
module.exports = router;