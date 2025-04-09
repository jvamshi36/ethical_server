// server/controllers/userTravelRoute.controller.js
const UserTravelRoute = require('../models/userTravelRoute.model');
const User = require('../models/user.model');

// Get all travel routes for the current user
exports.getUserRoutes = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const routes = await UserTravelRoute.findByUserId(userId);
    res.json(routes);
  } catch (error) {
    console.error('Error fetching user routes:', error);
    res.status(500).json({ message: 'Failed to fetch user travel routes' });
  }
};

// Get travel routes for a specific user (admin only)
exports.getUserRoutesById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const routes = await UserTravelRoute.findByUserId(userId);
    res.json(routes);
  } catch (error) {
    console.error('Error fetching user routes:', error);
    res.status(500).json({ message: 'Failed to fetch user travel routes' });
  }
};

// Get a specific route by ID
exports.getRouteById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const route = await UserTravelRoute.findById(id);
    
    if (!route) {
      return res.status(404).json({ message: 'Travel route not found' });
    }
    
    // If not admin, check if the route belongs to the user
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role) && route.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to access this route' });
    }
    
    res.json(route);
  } catch (error) {
    console.error('Error fetching travel route:', error);
    res.status(500).json({ message: 'Failed to fetch travel route' });
  }
};

// Create a new travel route for a user (admin only)
exports.createRoute = async (req, res) => {
  try {
    const { userId, fromCity, toCity, distance, amount } = req.body;
    
    // Validate required fields
    if (!userId || !fromCity || !toCity || !distance || !amount) {
      return res.status(400).json({ 
        message: 'User ID, from city, to city, distance and amount are required' 
      });
    }
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if route already exists
    const existingRoute = await UserTravelRoute.findByRoute(userId, fromCity, toCity);
    if (existingRoute) {
      return res.status(400).json({ message: 'Route already exists for this user' });
    }
    
    const route = await UserTravelRoute.create({
      userId,
      fromCity,
      toCity,
      distance: parseFloat(distance),
      amount: parseFloat(amount)
    });
    
    res.status(201).json(route);
  } catch (error) {
    console.error('Error creating travel route:', error);
    res.status(500).json({ message: 'Failed to create travel route' });
  }
};

// Update a travel route (admin only)
exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { fromCity, toCity, distance, amount, isActive } = req.body;
    
    // Check if route exists
    const route = await UserTravelRoute.findById(id);
    if (!route) {
      return res.status(404).json({ message: 'Travel route not found' });
    }
    
    const updatedRoute = await UserTravelRoute.update(id, {
      fromCity: fromCity || route.from_city,
      toCity: toCity || route.to_city,
      distance: distance ? parseFloat(distance) : route.distance,
      amount: amount ? parseFloat(amount) : route.amount,
      isActive: isActive !== undefined ? isActive : route.is_active
    });
    
    res.json(updatedRoute);
  } catch (error) {
    console.error('Error updating travel route:', error);
    res.status(500).json({ message: 'Failed to update travel route' });
  }
};

// Delete a travel route (admin only)
exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if route exists
    const route = await UserTravelRoute.findById(id);
    if (!route) {
      return res.status(404).json({ message: 'Travel route not found' });
    }
    
    await UserTravelRoute.delete(id);
    
    res.json({ message: 'Travel route deleted successfully' });
  } catch (error) {
    console.error('Error deleting travel route:', error);
    res.status(500).json({ message: 'Failed to delete travel route' });
  }
};

// Bulk create or update travel routes for a user (admin only)
exports.bulkCreateRoutes = async (req, res) => {
  try {
    const { userId, routes } = req.body;
    
    // Validate request
    if (!userId || !Array.isArray(routes) || routes.length === 0) {
      return res.status(400).json({ 
        message: 'User ID and routes array are required' 
      });
    }
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Validate each route
    for (const route of routes) {
      if (!route.fromCity || !route.toCity || !route.distance || !route.amount) {
        return res.status(400).json({ 
          message: 'Each route must include fromCity, toCity, distance, and amount' 
        });
      }
    }
    
    const createdRoutes = await UserTravelRoute.bulkCreate(userId, routes);
    
    res.status(201).json(createdRoutes);
  } catch (error) {
    console.error('Error bulk creating travel routes:', error);
    res.status(500).json({ message: 'Failed to create travel routes' });
  }
};