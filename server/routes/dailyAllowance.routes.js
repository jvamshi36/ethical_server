const express = require('express');
const router = express.Router();
const daController = require('../controllers/dailyAllowance.controller');
const { verifyToken, isManager } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Daily Allowance routes are working' });
});

// User routes
router.get('/', daController.getAllowances);
router.post('/', daController.createAllowance);
router.get('/:id', daController.getAllowanceById);
router.put('/:id', daController.updateAllowance);
router.delete('/:id', daController.deleteAllowance);

// Manager routes (requires manager role)
router.get('/team', isManager(), daController.getTeamAllowances);
router.get('/user/:userId', isManager(), daController.getUserAllowances);
router.patch('/:id/status', isManager(), daController.updateStatus);

module.exports = router;