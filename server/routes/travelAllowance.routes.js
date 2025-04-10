// server/routes/travelAllowance.routes.js
const express = require('express');
const router = express.Router();
const taController = require('../controllers/travelAllowance.controller');
const { verifyToken, isManager, isAdmin } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Travel Allowance routes are working' });
});

// User routes
router.get('/', taController.getAllowances);
router.post('/', taController.createAllowance);
router.get('/:id', taController.getAllowanceById);
router.put('/:id', taController.updateAllowance);
router.delete('/:id', taController.deleteAllowance);

// Admin routes
router.get('/admin/all', isAdmin(), taController.getAllAllowancesAdmin);

// Route validation endpoint
router.post('/validate-route', taController.validateRoute);

// Calculate distance between cities
router.post('/calculate-distance', taController.calculateDistance);

// Manager routes (requires manager role)
router.patch('/:id/status', isManager(), taController.updateStatus);

// Allow users to view their own allowances
router.get('/user/:userId', async (req, res, next) => {
  // Allow access if user is requesting their own data or is a manager/admin
  if (req.user.id === parseInt(req.params.userId) || 
      ['ABM', 'RBM', 'ZBM', 'DGM', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    return taController.getUserAllowances(req, res, next);
  }
  res.status(403).json({ message: 'Access denied' });
});

// Get available travel routes for the current user
router.get('/routes', taController.getUserTravelRoutes);

module.exports = router;