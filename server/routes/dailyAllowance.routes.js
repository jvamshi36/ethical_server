const express = require('express');
const router = express.Router();
const daController = require('../controllers/dailyAllowance.controller');

// Daily Allowance routes
// These are placeholder routes and will be implemented with actual functionality later
router.get('/', (req, res) => {
  res.json({ message: 'Daily Allowance routes are working' });
});

// Export the router
module.exports = router;