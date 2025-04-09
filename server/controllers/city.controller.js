// server/controllers/city.controller.js
const City = require('../models/city.model');

// Get all cities
exports.getAllCities = async (req, res) => {
  try {
    const cities = await City.findAll();
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ message: 'Failed to fetch cities' });
  }
};

// Get city by ID
exports.getCityById = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
    
    res.json(city);
  } catch (error) {
    console.error('Error fetching city:', error);
    res.status(500).json({ message: 'Failed to fetch city' });
  }
};

// Create new city
exports.createCity = async (req, res) => {
  try {
    const { name, state, headquarters } = req.body;
    
    if (!name || !state || !headquarters) {
      return res.status(400).json({ message: 'Name, state and headquarters are required' });
    }
    
    const city = await City.create({
      name,
      state,
      headquarters
    });
    
    res.status(201).json(city);
  } catch (error) {
    console.error('Error creating city:', error);
    res.status(500).json({ message: 'Failed to create city' });
  }
};

// Update city
exports.updateCity = async (req, res) => {
  try {
    const { name, state, headquarters, isActive } = req.body;
    
    // Check if city exists
    const city = await City.findById(req.params.id);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
    
    // Update city
    const updatedCity = await City.update(req.params.id, {
      name: name || city.name,
      state: state || city.state,
      headquarters: headquarters || city.headquarters,
      isActive: isActive !== undefined ? isActive : city.is_active
    });
    
    res.json(updatedCity);
  } catch (error) {
    console.error('Error updating city:', error);
    res.status(500).json({ message: 'Failed to update city' });
  }
};

// Delete city
exports.deleteCity = async (req, res) => {
  try {
    // Check if city exists
    const city = await City.findById(req.params.id);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
    
    // Delete city
    await City.delete(req.params.id);
    
    res.json({ message: 'City deleted successfully' });
  } catch (error) {
    console.error('Error deleting city:', error);
    res.status(500).json({ message: 'Failed to delete city' });
  }
};

// Calculate distance between cities
exports.calculateDistance = async (req, res) => {
  try {
    const { fromCity, toCity } = req.body;
    
    if (!fromCity || !toCity) {
      return res.status(400).json({ message: 'From and To cities are required' });
    }
    
    // Calculate distance
    const distanceData = await City.getDistanceBetweenCities(fromCity, toCity);
    
    res.json(distanceData);
  } catch (error) {
    console.error('Error calculating distance:', error);
    res.status(500).json({ message: 'Failed to calculate distance' });
  }
};