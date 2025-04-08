const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, authorize, isAdmin } = require('../middleware/auth.middleware');
const { validateUser, validateUserUpdate } = require('../middleware/validation.middleware');

// Test route (public)
router.get('/test', (req, res) => {
  res.json({ message: 'User routes are working' });
});

// Protected routes - require authentication
router.use(verifyToken);

// Basic routes - any authenticated user can access
router.get('/profile', (req, res) => {
  res.json(req.user);
});

// Get team members for current user (if manager)
router.get('/team', userController.getTeamMembers);

// Manager routes
router.get('/managers', userController.getManagers);

// Admin routes - restricted to admin roles
router.use(isAdmin());

// User management endpoints
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', validateUser, userController.createUser);
router.put('/:id', validateUserUpdate, userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/:id/reset-password', userController.resetPassword);
router.patch('/:id/status', userController.updateUserStatus);

// Team management
router.get('/hierarchy', userController.getUserHierarchy);
router.post('/:id/team', userController.updateTeam);

// Check email existence
router.get('/email/:email', userController.findByEmail);

module.exports = router;