// server/routes/headquarters.routes.js
const express = require('express');
const router = express.Router();
const headquartersController = require('../controllers/headquarters.controller');

// Test route first
router.get('/test', (req, res) => {
  res.json({ message: 'Headquarters routes are working' });
});

// Headquarters routes
router.get('/', headquartersController.getAllHeadquarters);
router.get('/:id', headquartersController.getHeadquartersById);
router.post('/', headquartersController.createHeadquarters);
router.put('/:id', headquartersController.updateHeadquarters);
router.delete('/:id', headquartersController.deleteHeadquarters);

// Export the router
module.exports = router;