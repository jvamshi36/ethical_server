// Save this file as: server/controllers/reference.controller.js
const Department = require('../models/department.model');
const Headquarters = require('../models/headquarters.model');

// Get departments for dropdown
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll();
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Failed to fetch departments' });
  }
};

// Get headquarters for dropdown
exports.getHeadquarters = async (req, res) => {
  try {
    const headquarters = await Headquarters.findAll();
    res.json(headquarters);
  } catch (error) {
    console.error('Error fetching headquarters:', error);
    res.status(500).json({ message: 'Failed to fetch headquarters' });
  }
};

// Get roles for dropdown
exports.getRoles = async (req, res) => {
  try {
    // These are the predefined roles based on your validation middleware
    const roles = [
      { value: 'BE', label: 'Business Executive' },
      { value: 'BM', label: 'Business Manager' },
      { value: 'SBM', label: 'Senior Business Manager' },
      { value: 'ABM', label: 'Area Business Manager' },
      { value: 'RBM', label: 'Regional Business Manager' },
      { value: 'ZBM', label: 'Zonal Business Manager' },
      { value: 'DGM', label: 'Deputy General Manager' },
      { value: 'ADMIN', label: 'Administrator' },
      { value: 'SUPER_ADMIN', label: 'Super Administrator' }
    ];
    
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Failed to fetch roles' });
  }
};