const TravelAllowance = require('../models/travelAllowance.model');
const UserTravelRoute = require('../models/userTravelRoute.model');

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

// Get all pending allowances for admin approval
exports.getPendingAllowances = async (req, res) => {
  try {
    // For admin/super admin, get all pending allowances
    // For managers, get only their team's pending allowances
    const managerId = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role) ? null : req.user.id;
    const allowances = await TravelAllowance.findPendingApprovals(managerId);
    res.json(allowances);
  } catch (error) {
    console.error('Error fetching pending allowances:', error);
    res.status(500).json({ message: 'Failed to fetch pending allowances' });
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
    const { startDate, endDate } = req.query;
    const allowances = await TravelAllowance.findByUserId(req.params.userId, startDate, endDate);
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
    const { date, fromCity, toCity, travelMode, stationType, remarks } = req.body;
    const userId = req.user.id;
    
    // Prevent admin and super admin from creating allowances
    if (['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        message: 'Administrators cannot create allowance requests'
      });
    }
    
    // Check if this is a predefined route for the user
    const userRoute = await UserTravelRoute.findByRoute(userId, fromCity, toCity);
    
    if (!userRoute) {
      return res.status(400).json({ 
        message: 'This travel route is not configured for you. Please contact an administrator.' 
      });
    }
    
    // Use the predefined distance and amount from the configured route
    const allowance = await TravelAllowance.create({
      userId,
      date,
      fromCity,
      toCity,
      distance: userRoute.distance,
      travelMode,
      stationType,
      amount: userRoute.amount,
      remarks
    });
    
    // Automatically create a daily allowance with adjusted amount based on station type
    if (stationType && ['OUTSTATION', 'EX_STATION'].includes(stationType)) {
      try {
        // Check if user already has a daily allowance for this date
        const DailyAllowance = require('../models/dailyAllowance.model');
        const RoleAllowance = require('../models/roleAllowance.model');
        const StationTypeAllowance = require('../models/stationTypeAllowance.model');
        
        console.log(`Processing daily allowance for user ${userId} with station type ${stationType} for date ${date}`);
        
        const existingAllowance = await DailyAllowance.findExistingAllowance(userId, date);
        
        if (!existingAllowance) {
          // Get base allowance amount for user's role
          const baseAmount = await RoleAllowance.getDailyAllowanceForUser(userId);
          console.log(`Base daily allowance amount for user ${userId}: ${baseAmount}`);
          
          if (baseAmount) {
            // Calculate adjusted amount based on station type
            const adjustedAmount = await StationTypeAllowance.calculateAdjustedAllowance(baseAmount, stationType);
            console.log(`Adjusted amount for ${stationType}: ${adjustedAmount}`);
            
            // Check if there's a scheduler-created allowance for this date
            const schedulerAllowance = await DailyAllowance.findExistingAllowance(userId, date, 'SCHEDULER');
            
            if (schedulerAllowance) {
              // Delete the scheduler-created allowance since we're creating one from travel allowance
              console.log(`Deleting scheduler-created daily allowance for user ${userId} on date ${date} since travel allowance was submitted`);
              await DailyAllowance.delete(schedulerAllowance.id);
            }

            // Check if there's any existing daily allowance (regardless of source)
            const existingDailyAllowance = await DailyAllowance.findExistingAllowance(userId, date);
            if (existingDailyAllowance) {
              // Delete the existing daily allowance
              console.log(`Deleting existing daily allowance for user ${userId} on date ${date} to create new one from travel allowance`);
              await DailyAllowance.delete(existingDailyAllowance.id);
            }
            
            // Create the daily allowance with adjusted amount and TRAVEL_ALLOWANCE source
            const dailyAllowance = await DailyAllowance.create({
              userId,
              date,
              amount: adjustedAmount,
              remarks: `Auto-generated for ${stationType} travel`,
              source: 'TRAVEL_ALLOWANCE'
            });}
            
            console.log(`Created special daily allowance for user ${userId} with station type ${stationType}`, dailyAllowance);
          } else {
            console.error(`No base allowance amount configured for user ${userId}`);
          }
        } else {
          console.log(`User ${userId} already has a daily allowance for ${date}:`, existingAllowance);
        }
      } catch (daError) {
        console.error('Error creating automatic daily allowance:', daError.message);
        console.error('Error details:', daError.stack);
        // Continue even if daily allowance creation fails, but log the full error
      }
    } else {
      console.log(`Station type ${stationType} not eligible for special daily allowance`);
    }
    
    res.status(201).json(allowance);
  } catch (error) {
    console.error('Error creating travel allowance:', error);
    res.status(500).json({ message: 'Failed to create travel allowance' });
  }
};

// Update a travel allowance
exports.updateAllowance = async (req, res) => {
  try {
    const { date, fromCity, toCity, travelMode, remarks } = req.body;
    
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
    
    // If travel route is changed, verify it's allowed and get the new amount and distance
    let distance = allowance.distance;
    let amount = allowance.amount;
    
    if (fromCity !== allowance.from_city || toCity !== allowance.to_city) {
      // Check if this is a predefined route for the user
      const userRoute = await UserTravelRoute.findByRoute(req.user.id, fromCity, toCity);
      
      if (!userRoute) {
        return res.status(400).json({ 
          message: 'This travel route is not configured for you. Please contact an administrator.' 
        });
      }
      
      // Use the predefined distance and amount from the configured route
      distance = userRoute.distance;
      amount = userRoute.amount;
    }
    
    // Get the station type from the existing allowance
    const stationType = allowance.station_type;
    
    // Update allowance (amount and distance are from the predefined route)
    const updatedAllowance = await TravelAllowance.update(req.params.id, {
      date,
      fromCity,
      toCity,
      distance,
      travelMode,
      stationType,
      amount,
      remarks
    });
    
    // Automatically update or create a daily allowance with adjusted amount based on station type
    if (stationType && ['OUTSTATION', 'EX_STATION'].includes(stationType)) {
      try {
        // Check if user already has a daily allowance for this date
        const DailyAllowance = require('../models/dailyAllowance.model');
        const RoleAllowance = require('../models/roleAllowance.model');
        const StationTypeAllowance = require('../models/stationTypeAllowance.model');
        
        console.log(`Attempting to create/update daily allowance for user ${req.user.id} with station type ${stationType}`);
        
        const existingAllowance = await DailyAllowance.findExistingAllowance(req.user.id, date);
        
        // Get base allowance amount for user's role
        const baseAmount = await RoleAllowance.getDailyAllowanceForUser(req.user.id);
        console.log(`Base amount for user ${req.user.id}: ${baseAmount}`);
        
        if (baseAmount) {
          // Calculate adjusted amount based on station type
          const adjustedAmount = await StationTypeAllowance.calculateAdjustedAllowance(baseAmount, stationType);
          console.log(`Adjusted amount for ${stationType}: ${adjustedAmount}`);
          
          if (existingAllowance) {
            // Update the existing daily allowance
            const updatedAllowance = await DailyAllowance.update(existingAllowance.id, {
              date,
              amount: adjustedAmount,
              remarks: `Updated for ${stationType} travel`
            });
            console.log(`Updated special daily allowance for user ${req.user.id} with station type ${stationType}`, updatedAllowance);
          } else {
            // Create a new daily allowance
            const createdAllowance = await DailyAllowance.create({
              userId: req.user.id,
              date,
              amount: adjustedAmount,
              remarks: `Auto-generated for ${stationType} travel`
            });
            console.log(`Created special daily allowance for user ${req.user.id} with station type ${stationType}`, createdAllowance);
          }
        } else {
          console.error(`No base amount found for user ${req.user.id}`);
        }
      } catch (daError) {
        console.error('Error updating/creating automatic daily allowance:', daError.message);
        console.error('Error details:', daError.stack);
        // Continue even if daily allowance creation fails, but log the full error
      }
    } else {
      console.log(`No daily allowance created/updated - station type ${stationType} not eligible`);
    }
    
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

// Get available travel routes for the current user
// Get available travel routes for the current user
// In travelAllowance.controller.js
exports.getUserTravelRoutes = async (req, res) => {
  try {
    console.log("Getting travel routes for user:", req.user.id);
    const routes = await UserTravelRoute.findByUserId(req.user.id);
    console.log(`Found ${routes.length} routes for user ID ${req.user.id}`);
    res.json(routes);
  } catch (error) {
    console.error('Error fetching user travel routes:', error);
    res.status(500).json({ 
      message: 'Failed to fetch travel routes'
    });
  }
};

// Add this function to server/controllers/travelAllowance.controller.js

// Validate if route is configured for user
exports.validateRoute = async (req, res) => {
  try {
    const { fromCity, toCity } = req.body;
    const userId = req.user.id;
    
    if (!fromCity || !toCity) {
      return res.status(400).json({ message: 'From and To cities are required' });
    }
    
    // Check if this is a predefined route for the user
    const userRoute = await UserTravelRoute.findByRoute(userId, fromCity, toCity);
    
    if (!userRoute) {
      return res.status(403).json({ 
        message: 'This travel route is not configured for you. Please contact an administrator.' 
      });
    }
    
    // Return the predefined distance and amount from the configured route
    res.json({
      valid: true,
      fromCity,
      toCity,
      distance: userRoute.distance,
      amount: userRoute.amount
    });
  } catch (error) {
    console.error('Error validating route:', error);
    res.status(500).json({ message: 'Failed to validate route' });
  }
};
// Calculate distance between cities
exports.calculateDistance = async (req, res) => {
  try {
    const { fromCity, toCity } = req.body;
    const userId = req.user.id;
    
    if (!fromCity || !toCity) {
      return res.status(400).json({ message: 'From and To cities are required' });
    }
    
    // Check if this is a predefined route for the user
    const userRoute = await UserTravelRoute.findByRoute(userId, fromCity, toCity);
    
    if (!userRoute) {
      return res.status(400).json({ 
        message: 'This travel route is not configured for you. Please contact an administrator.' 
      });
    }
    
    // Return the predefined distance and amount from the configured route
    res.json({
      fromCity,
      toCity,
      distance: userRoute.distance,
      amount: userRoute.amount
    });
  } catch (error) {
    console.error('Error calculating distance:', error);
    res.status(500).json({ message: 'Failed to calculate distance' });
  }
};
// Add this method to the travelAllowance.controller.js file

// Get all travel allowances for admin
exports.getAllAllowancesAdmin = async (req, res) => {
  try {
    // Check if user is admin or super admin
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const allowances = await TravelAllowance.findAll();
    res.json(allowances);
  } catch (error) {
    console.error('Error fetching all travel allowances:', error);
    res.status(500).json({ message: 'Failed to fetch travel allowances' });
  }
};

// Get all travel allowances for admin
exports.getAllAllowancesAdmin = async (req, res) => {
  try {
    // Check if user is admin or super admin
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const allowances = await TravelAllowance.findAll();
    res.json(allowances);
  } catch (error) {
    console.error('Error fetching all travel allowances:', error);
    res.status(500).json({ message: 'Failed to fetch travel allowances' });
  }
};