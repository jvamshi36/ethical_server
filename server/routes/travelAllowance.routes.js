// server/routes/travelAllowance.routes.js
const express = require('express');
const router = express.Router();
const taController = require('../controllers/travelAllowance.controller');
const { verifyToken, isManager } = require('../middleware/auth.middleware');

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

// Route validation endpoint
router.post('/validate-route', taController.validateRoute);

// Calculate distance between cities
router.post('/calculate-distance', taController.calculateDistance);

// Manager routes (requires manager role)
router.get('/team', isManager(), taController.getTeamAllowances);
router.get('/user/:userId', isManager(), taController.getUserAllowancesByUserId || taController.getUserAllowances);
router.patch('/:id/status', isManager(), taController.updateStatus);

// Get available travel routes for the current user
router.get('/routes', taController.getUserTravelRoutes);

module.exports = router;