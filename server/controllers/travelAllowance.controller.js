const TravelAllowance = require('../models/travelAllowance.model');

// Get all travel allowances for the current user
exports.getAllowances = async (req, res) => {
  try {
    const allowances = await TravelAllowance.findByUserId(req.user.id);
    res.json(allowances);
  } catch (error) {
    console.error('Error fetching travel allowances:', error);
    res.status(500).json({ message: 'Failed to fetch travel allowances' });
  }
};

// Get team travel allowances for the current manager
exports.getTeamAllowances = async (req, res) => {
  try {
    const allowances = await TravelAllowance.findByTeamManager(req.user.id);
    res.json(allowances);
  } catch (error) {
    console.error('Error fetching team travel allowances:', error);
    res.status(500).json({ message: 'Failed to fetch team travel allowances' });
  }
};

// Get travel allowances for a specific user
exports.getUserAllowances = async (req, res) => {
  try {
    const allowances = await TravelAllowance.findByUserId(req.params.userId);
    res.json(allowances);
  } catch (error) {
    console.error('Error fetching user travel allowances:', error);
    res.status(500).json({ message: 'Failed to fetch user travel allowances' });
  }
};

// Get a specific travel allowance
exports.getAllowanceById = async (req, res) => {
  try {
    const allowance = await TravelAllowance.findById(req.params.id);
    
    if (!allowance) {
      return res.status(404).json({ message: 'Travel allowance not found' });
    }
    
    res.json(allowance);
  } catch (error) {
    console.error('Error fetching travel allowance:', error);
    res.status(500).json({ message: 'Failed to fetch travel allowance' });
  }
};

// Create a new travel allowance
exports.createAllowance = async (req, res) => {
  try {
    const { date, fromCity, toCity, distance, travelMode, amount, remarks } = req.body;
    
    const allowance = await TravelAllowance.create({
      userId: req.user.id,
      date,
      fromCity,
      toCity,
      distance,
      travelMode,
      amount,
      remarks
    });
    
    res.status(201).json(allowance);
  } catch (error) {
    console.error('Error creating travel allowance:', error);
    res.status(500).json({ message: 'Failed to create travel allowance' });
  }
};

// Update a travel allowance
exports.updateAllowance = async (req, res) => {
  try {
    const { date, fromCity, toCity, distance, travelMode, amount, remarks } = req.body;
    
    // Check if allowance exists
    const allowance = await TravelAllowance.findById(req.params.id);
    if (!allowance) {
      return res.status(404).json({ message: 'Travel allowance not found' });
    }
    
    // Check if user is the owner of this allowance
    if (allowance.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own allowances' });
    }
    
    // Check if allowance is in PENDING status
    if (allowance.status !== 'PENDING') {
      return res.status(403).json({ message: 'You can only update allowances in PENDING status' });
    }
    
    // Update allowance
    const updatedAllowance = await TravelAllowance.update(req.params.id, {
      date,
      fromCity,
      toCity,
      distance,
      travelMode,
      amount,
      remarks
    });
    
    res.json(updatedAllowance);
  } catch (error) {
    console.error('Error updating travel allowance:', error);
    res.status(500).json({ message: 'Failed to update travel allowance' });
  }
};

// Delete a travel allowance
exports.deleteAllowance = async (req, res) => {
  try {
    // Check if allowance exists
    const allowance = await TravelAllowance.findById(req.params.id);
    if (!allowance) {
      return res.status(404).json({ message: 'Travel allowance not found' });
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
    await TravelAllowance.delete(req.params.id);
    
    res.json({ message: 'Travel allowance deleted successfully' });
  } catch (error) {
    console.error('Error deleting travel allowance:', error);
    res.status(500).json({ message: 'Failed to delete travel allowance' });
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
    const allowance = await TravelAllowance.findById(req.params.id);
    if (!allowance) {
      return res.status(404).json({ message: 'Travel allowance not found' });
    }
    
    // Check if the allowance is in PENDING status
    if (allowance.status !== 'PENDING') {
      return res.status(403).json({ message: 'You can only update allowances in PENDING status' });
    }
    
    // Update allowance status
    const updatedAllowance = await TravelAllowance.updateStatus(req.params.id, status, req.user.id);
    
    res.json(updatedAllowance);
  } catch (error) {
    console.error('Error updating allowance status:', error);
    res.status(500).json({ message: 'Failed to update allowance status' });
  }
};

// Calculate distance between cities
exports.calculateDistance = async (req, res) => {
  try {
    const { fromCity, toCity } = req.body;
    
    if (!fromCity || !toCity) {
      return res.status(400).json({ message: 'From and To cities are required' });
    }
    
    const distanceData = await TravelAllowance.getDistanceBetweenCities(fromCity, toCity);
    
    res.json(distanceData);
  } catch (error) {
    console.error('Error calculating distance:', error);
    res.status(500).json({ message: 'Failed to calculate distance' });
  }
};