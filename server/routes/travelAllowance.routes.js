const express = require('express');
const router = express.Router();
const taController = require('../controllers/travelAllowance.controller');

// Travel Allowance routes
// These are placeholder routes and will be implemented with actual functionality later
router.get('/', (req, res) => {
  res.json({ message: 'Travel Allowance routes are working' });
});

// Export the router
module.exports = router;