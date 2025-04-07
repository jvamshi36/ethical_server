const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Auth routes
router.post('/login', authController.login);

// Export the router
module.exports = router;
