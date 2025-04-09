// server/routes/userTravelRoute.routes.js
const express = require('express');
const router = express.Router();
const userTravelRouteController = require('../controllers/userTravelRoute.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'User Travel Route routes are working' });
});

// Get routes for current user (any authenticated user)
router.get('/my-routes', userTravelRouteController.getUserRoutes);

// Admin-only routes
router.use(isAdmin());

// Get all routes for a specific user
router.get('/user/:userId', userTravelRouteController.getUserRoutesById);

// Get, update, or delete a specific route
router.get('/:id', userTravelRouteController.getRouteById);
router.put('/:id', userTravelRouteController.updateRoute);
router.delete('/:id', userTravelRouteController.deleteRoute);

// Create a new route
router.post('/', userTravelRouteController.createRoute);

// Bulk create/update routes
router.post('/bulk', userTravelRouteController.bulkCreateRoutes);

module.exports = router;