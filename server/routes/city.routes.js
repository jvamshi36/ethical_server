// server/routes/city.routes.js
const express = require('express');
const router = express.Router();
const cityController = require('../controllers/city.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all cities (available to all users)
router.get('/', cityController.getAllCities);

// Get city by ID (available to all users)
router.get('/:id', cityController.getCityById);

// Calculate distance between cities (available to all users)
router.post('/distance', cityController.calculateDistance);

// Admin-only routes
router.use(isAdmin());

// Create new city
router.post('/', cityController.createCity);

// Update city
router.put('/:id', cityController.updateCity);

// Delete city
router.delete('/:id', cityController.deleteCity);

module.exports = router;