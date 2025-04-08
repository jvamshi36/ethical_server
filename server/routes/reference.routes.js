// Save this file as: server/routes/reference.routes.js
const express = require('express');
const router = express.Router();
const referenceController = require('../controllers/reference.controller');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Reference routes are working' });
});

// Reference data routes
router.get('/departments', referenceController.getDepartments);
router.get('/headquarters', referenceController.getHeadquarters);
router.get('/roles', referenceController.getRoles);

// Export the router
module.exports = router;