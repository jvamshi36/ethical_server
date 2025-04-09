// server/controllers/roleAllowance.controller.js
const RoleAllowance = require('../models/roleAllowance.model');

// Get all role allowances
exports.getAllRoleAllowances = async (req, res) => {
  try {
    const allowances = await RoleAllowance.findAll();
    res.json(allowances);
  } catch (error) {
    console.error('Error fetching role allowances:', error);
    res.status(500).json({ message: 'Failed to fetch role allowances' });
  }
};

// Get allowance for a specific role
exports.getRoleAllowance = async (req, res) => {
  try {
    const { role } = req.params;
    
    const allowance = await RoleAllowance.findByRole(role);
    
    if (!allowance) {
      return res.status(404).json({ message: 'Role allowance not found' });
    }
    
    res.json(allowance);
  } catch (error) {
    console.error('Error fetching role allowance:', error);
    res.status(500).json({ message: 'Failed to fetch role allowance' });
  }
};

// Update allowance for a specific role
exports.updateRoleAllowance = async (req, res) => {
  try {
    const { role } = req.params;
    const { amount } = req.body;
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    
    const updatedAllowance = await RoleAllowance.updateAmount(role, parseFloat(amount));
    
    res.json(updatedAllowance);
  } catch (error) {
    console.error('Error updating role allowance:', error);
    res.status(500).json({ message: 'Failed to update role allowance' });
  }
};

// Get allowance for the current user
exports.getCurrentUserAllowance = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const allowance = await RoleAllowance.getDailyAllowanceForUser(userId);
    
    if (!allowance) {
      return res.status(404).json({ message: 'Daily allowance not configured for your role' });
    }
    
    res.json({ amount: allowance });
  } catch (error) {
    console.error('Error fetching user allowance:', error);
    res.status(500).json({ message: 'Failed to fetch user allowance' });
  }
};