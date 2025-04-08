const Headquarters = require('../models/headquarters.model');

// Get all headquarters
exports.getAllHeadquarters = async (req, res) => {
  try {
    const headquarters = await Headquarters.findAll();
    res.json(headquarters);
  } catch (error) {
    console.error('Error fetching headquarters:', error);
    res.status(500).json({ message: 'Failed to fetch headquarters' });
  }
};

// Get headquarters by ID
exports.getHeadquartersById = async (req, res) => {
  try {
    const headquarters = await Headquarters.findById(req.params.id);
    
    if (!headquarters) {
      return res.status(404).json({ message: 'Headquarters not found' });
    }
    
    res.json(headquarters);
  } catch (error) {
    console.error('Error fetching headquarters:', error);
    res.status(500).json({ message: 'Failed to fetch headquarters' });
  }
};

// Create new headquarters
exports.createHeadquarters = async (req, res) => {
  try {
    const { name, location, address } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Headquarters name is required' });
    }
    
    const headquarters = await Headquarters.create({
      name,
      location: location || '',
      address: address || ''
    });
    
    res.status(201).json(headquarters);
  } catch (error) {
    console.error('Error creating headquarters:', error);
    res.status(500).json({ message: 'Failed to create headquarters' });
  }
};

// Update headquarters
exports.updateHeadquarters = async (req, res) => {
  try {
    const { name, location, address, isActive } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Headquarters name is required' });
    }
    
    // Check if headquarters exists
    const headquarters = await Headquarters.findById(req.params.id);
    if (!headquarters) {
      return res.status(404).json({ message: 'Headquarters not found' });
    }
    
    // Update headquarters
    const updatedHeadquarters = await Headquarters.update(req.params.id, {
      name,
      location: location || '',
      address: address || '',
      isActive: isActive !== undefined ? isActive : true
    });
    
    res.json(updatedHeadquarters);
  } catch (error) {
    console.error('Error updating headquarters:', error);
    res.status(500).json({ message: 'Failed to update headquarters' });
  }
};

// Delete headquarters
exports.deleteHeadquarters = async (req, res) => {
  try {
    // Check if headquarters exists
    const headquarters = await Headquarters.findById(req.params.id);
    if (!headquarters) {
      return res.status(404).json({ message: 'Headquarters not found' });
    }
    
    // Delete headquarters
    await Headquarters.delete(req.params.id);
    
    res.json({ message: 'Headquarters deleted successfully' });
  } catch (error) {
    console.error('Error deleting headquarters:', error);
    res.status(500).json({ message: 'Failed to delete headquarters' });
  }
};