// server/routes/reference.routes.js
const express = require('express');
const router = express.Router();
const referenceController = require('../controllers/reference.controller');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Reference routes are working' });
});

// Reference data routes with mock data fallbacks
// Departments
router.get('/departments', async (req, res) => {
  try {
    // Try using the controller first
    await referenceController.getDepartments(req, res);
  } catch (error) {
    console.warn('Falling back to mock departments data:', error);
    // Fallback to mock data
    const mockDepartments = [
      { id: 1, name: 'Sales', description: 'Sales department' },
      { id: 2, name: 'Marketing', description: 'Marketing department' },
      { id: 3, name: 'Operations', description: 'Operations department' },
      { id: 4, name: 'Finance', description: 'Finance department' },
      { id: 5, name: 'Human Resources', description: 'HR department' },
      { id: 6, name: 'Research & Development', description: 'R&D department' }
    ];
    
    res.json(mockDepartments);
  }
});

// Headquarters
router.get('/headquarters', async (req, res) => {
  try {
    // Try using the controller first
    await referenceController.getHeadquarters(req, res);
  } catch (error) {
    console.warn('Falling back to mock headquarters data:', error);
    // Fallback to mock data
    const mockHeadquarters = [
      { id: 1, name: 'East HQ', location: 'New York', address: '123 Main St, New York, NY 10001' },
      { id: 2, name: 'West HQ', location: 'San Francisco', address: '456 Market St, San Francisco, CA 94105' },
      { id: 3, name: 'Central HQ', location: 'Chicago', address: '789 Michigan Ave, Chicago, IL 60611' },
      { id: 4, name: 'South HQ', location: 'Dallas', address: '101 Main Plaza, Dallas, TX 75201' }
    ];
    
    res.json(mockHeadquarters);
  }
});

// Roles
router.get('/roles', async (req, res) => {
  try {
    // Try using the controller first
    await referenceController.getRoles(req, res);
  } catch (error) {
    console.warn('Falling back to mock roles data:', error);
    // Fallback to mock data
    const mockRoles = [
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
    
    res.json(mockRoles);
  }
});

module.exports = router;