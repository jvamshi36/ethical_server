// server/routes/department.routes.js
const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');

// Test route first
router.get('/test', (req, res) => {
  res.json({ message: 'Department routes are working' });
});

// Department routes
router.get('/', departmentController.getAllDepartments);
router.get('/:id', departmentController.getDepartmentById);
router.post('/', departmentController.createDepartment);
router.put('/:id', departmentController.updateDepartment);
router.delete('/:id', departmentController.deleteDepartment);

// Export the router
module.exports = router;