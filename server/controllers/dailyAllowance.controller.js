const DailyAllowance = require('../models/dailyAllowance.model');
const RoleAllowance = require('../models/roleAllowance.model');

// Get all daily allowances for the current user
exports.getAllowances = async (req, res) => {
  try {
    const allowances = await DailyAllowance.findByUserId(req.user.id);
    res.json(allowances);
  } catch (error) {
    console.error('Error fetching daily allowances:', error);
    res.status(500).json({ message: 'Failed to fetch daily allowances' });
  }
};

// Get team daily allowances for the current manager
exports.getTeamAllowances = async (req, res) => {
  try {
    const allowances = await DailyAllowance.findByTeamManager(req.user.id);
    res.json(allowances);
  } catch (error) {
    console.error('Error fetching team daily allowances:', error);
    res.status(500).json({ message: 'Failed to fetch team daily allowances' });
  }
};

// Get all pending allowances for admin approval
exports.getPendingAllowances = async (req, res) => {
  try {
    // For admin/super admin, get all pending allowances
    // For managers, get only their team's pending allowances
    const managerId = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role) ? null : req.user.id;
    const allowances = await DailyAllowance.findPendingApprovals(managerId);
    res.json(allowances);
  } catch (error) {
    console.error('Error fetching pending allowances:', error);
    res.status(500).json({ message: 'Failed to fetch pending allowances' });
  }
};

// Get daily allowances for a specific user
exports.getUserAllowances = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const allowances = await DailyAllowance.findByUserId(req.params.userId, startDate, endDate);
    res.json(allowances);
  } catch (error) {
    console.error('Error fetching user daily allowances:', error);
    res.status(500).json({ message: 'Failed to fetch user daily allowances' });
  }
};

// Get a specific daily allowance
exports.getAllowanceById = async (req, res) => {
  try {
    const allowance = await DailyAllowance.findById(req.params.id);
    
    if (!allowance) {
      return res.status(404).json({ message: 'Daily allowance not found' });
    }
    
    res.json(allowance);
  } catch (error) {
    console.error('Error fetching daily allowance:', error);
    res.status(500).json({ message: 'Failed to fetch daily allowance' });
  }
};

// Create a new daily allowance (now with automatic amount from role)
exports.createAllowance = async (req, res) => {
  try {
    const { date, remarks } = req.body;
    const userId = req.user.id;
    
    // Prevent admin and super admin from creating allowances
    if (['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        message: 'Administrators cannot create allowance requests'
      });
    }
    
    // Get the fixed daily allowance amount for the user's role
    const allowanceAmount = await RoleAllowance.getDailyAllowanceForUser(userId);
    
    if (!allowanceAmount) {
      return res.status(400).json({ 
        message: 'Daily allowance amount not configured for your role. Please contact an administrator.' 
      });
    }
    
    const allowance = await DailyAllowance.create({
      userId,
      date,
      amount: allowanceAmount,
      remarks
    });
    
    res.status(201).json(allowance);
  } catch (error) {
    console.error('Error creating daily allowance:', error);
    res.status(500).json({ message: 'Failed to create daily allowance' });
  }
};

// Update a daily allowance (only remarks can be updated by user)
exports.updateAllowance = async (req, res) => {
  try {
    const { date, remarks } = req.body;
    
    // Check if allowance exists
    const allowance = await DailyAllowance.findById(req.params.id);
    if (!allowance) {
      return res.status(404).json({ message: 'Daily allowance not found' });
    }
    
    // Check if user is the owner of this allowance
    if (allowance.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own allowances' });
    }
    
    // Check if allowance is in PENDING status
    if (allowance.status !== 'PENDING') {
      return res.status(403).json({ message: 'You can only update allowances in PENDING status' });
    }
    
    // Get the fixed daily allowance amount (in case the role changed)
    const allowanceAmount = await RoleAllowance.getDailyAllowanceForUser(req.user.id);
    
    // Update allowance (only date and remarks - amount is fixed by role)
    const updatedAllowance = await DailyAllowance.update(req.params.id, {
      date,
      amount: allowanceAmount, // Always use the role-based amount
      remarks
    });
    
    res.json(updatedAllowance);
  } catch (error) {
    console.error('Error updating daily allowance:', error);
    res.status(500).json({ message: 'Failed to update daily allowance' });
  }
};

// Delete a daily allowance
exports.deleteAllowance = async (req, res) => {
  try {
    // Check if allowance exists
    const allowance = await DailyAllowance.findById(req.params.id);
    if (!allowance) {
      return res.status(404).json({ message: 'Daily allowance not found' });
    }
    
    // Check if user is the owner of this allowance
    if (allowance.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own allowances' });
    }
    
    // Check if allowance is in PENDING status
    if (allowance.status !== 'PENDING') {
      return res.status(403).json({ message: 'You can only delete allowances in PENDING status' });
    }
    
    // Delete allowance
    await DailyAllowance.delete(req.params.id);
    
    res.json({ message: 'Daily allowance deleted successfully' });
  } catch (error) {
    console.error('Error deleting daily allowance:', error);
    res.status(500).json({ message: 'Failed to delete daily allowance' });
  }
};

// Update allowance status (approve/reject)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Check if status is valid
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be APPROVED or REJECTED' });
    }
    
    // Check if allowance exists
    const allowance = await DailyAllowance.findById(req.params.id);
    if (!allowance) {
      return res.status(404).json({ message: 'Daily allowance not found' });
    }
    
    // Check if the allowance is in PENDING status
    if (allowance.status !== 'PENDING') {
      return res.status(403).json({ message: 'You can only update allowances in PENDING status' });
    }
    
    // Update allowance status
    const updatedAllowance = await DailyAllowance.updateStatus(req.params.id, status, req.user.id);
    
    res.json(updatedAllowance);
  } catch (error) {
    console.error('Error updating allowance status:', error);
    res.status(500).json({ message: 'Failed to update allowance status' });
  }
};
// Add this method to the dailyAllowance.controller.js file

// Get all daily allowances for admin
exports.getAllAllowancesAdmin = async (req, res) => {
  try {
    // Check if user is admin or super admin
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const allowances = await DailyAllowance.findAll();
    res.json(allowances);
  } catch (error) {
    console.error('Error fetching all daily allowances:', error);
    res.status(500).json({ message: 'Failed to fetch daily allowances' });
  }
};

// Modify the createAllowance method to restrict admin and super admin
exports.createAllowance = async (req, res) => {
  try {
    const { date, remarks } = req.body;
    const userId = req.user.id;
    
    // Prevent admin and super admin from creating allowances
    if (['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        message: 'Administrators cannot create allowance requests'
      });
    }
    
    // Get the fixed daily allowance amount for the user's role
    const allowanceAmount = await RoleAllowance.getDailyAllowanceForUser(userId);
    
    if (!allowanceAmount) {
      return res.status(400).json({ 
        message: 'Daily allowance amount not configured for your role. Please contact an administrator.' 
      });
    }
    
    const allowance = await DailyAllowance.create({
      userId,
      date,
      amount: allowanceAmount,
      remarks
    });
    
    res.status(201).json(allowance);
  } catch (error) {
    console.error('Error creating daily allowance:', error);
    res.status(500).json({ message: 'Failed to create daily allowance' });
  }
};