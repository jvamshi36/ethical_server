// server/routes/roleAllowance.routes.js
const express = require('express');
const router = express.Router();
const roleAllowanceController = require('../controllers/roleAllowance.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Role Allowance routes are working' });
});

// Get current user's allowance (any authenticated user)
router.get('/my-allowance', roleAllowanceController.getCurrentUserAllowance);

// Admin routes (requires admin role)
router.use(isAdmin());

// Get all role allowances
router.get('/', roleAllowanceController.getAllRoleAllowances);

// Get allowance for a specific role
router.get('/:role', roleAllowanceController.getRoleAllowance);

// Update allowance for a specific role
router.put('/:role', roleAllowanceController.updateRoleAllowance);

module.exports = router;