const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../config/config');

// Verify JWT token middleware
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Attach user to request
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ message: 'User account is inactive' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Role-based authorization middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    
    next();
  };
};

// Headquarters-based authorization middleware
exports.authorizeHeadquarters = () => {
  return async (req, res, next) => {
    // Used to restrict access to users in the same headquarters
    // Relevant for mid-level roles like ABM/RBM
    
    // Get the target user's headquarters
    const targetUserId = req.params.userId || req.body.userId;
    
    // If the user is an admin or senior role, allow access
    if (['ADMIN', 'SUPER_ADMIN', 'ZBM', 'DGM'].includes(req.user.role)) {
      return next();
    }
    
    try {
      // For mid-level roles, check if they are in the same headquarters as the target
      const targetUser = await User.findById(targetUserId);
      
      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (targetUser.headquarters !== req.user.headquarters) {
        return res.status(403).json({
          message: 'You can only access users from your headquarters'
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: 'Error checking headquarters' });
    }
  };
};

// Team-based authorization middleware
exports.authorizeTeam = () => {
  return async (req, res, next) => {
    // Used to restrict access to a user's team members
    // Relevant for mid-level roles like ABM/RBM
    
    const targetUserId = req.params.userId || req.body.userId;
    
    // If the user is in a senior role, allow access
    if (['ADMIN', 'SUPER_ADMIN', 'ZBM', 'DGM'].includes(req.user.role)) {
      return next();
    }
    
    try {
      // If the target is the user themselves, allow access
      if (req.user.id.toString() === targetUserId) {
        return next();
      }
      
      // For mid-level roles, check if the target is in their team
      if (['ABM', 'RBM'].includes(req.user.role)) {
        // Get user's team members
        const teamMembers = await User.getTeamMembers(req.user.id);
        const isTeamMember = teamMembers.some(member => member.id.toString() === targetUserId);
        
        if (!isTeamMember) {
          return res.status(403).json({
            message: 'You can only access your team members'
          });
        }
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: 'Error checking team authorization' });
    }
  };
};

// Allowance owner middleware
exports.isAllowanceOwner = (modelName) => {
  return async (req, res, next) => {
    try {
      const Model = require(`../models/${modelName}.model`);
      const allowance = await Model.findById(req.params.id);
      
      if (!allowance) {
        return res.status(404).json({ message: 'Allowance not found' });
      }
      
      // If the user is the owner, allow access
      if (allowance.user_id === req.user.id) {
        return next();
      }
      
      // If the user is an admin or senior role, allow access
      if (['ADMIN', 'SUPER_ADMIN', 'ZBM', 'DGM'].includes(req.user.role)) {
        return next();
      }
      
      // For mid-level roles, check if the allowance belongs to a team member
      if (['ABM', 'RBM'].includes(req.user.role)) {
        // Get user's team members
        const teamMembers = await User.getTeamMembers(req.user.id);
        const isTeamMemberAllowance = teamMembers.some(member => member.id === allowance.user_id);
        
        if (isTeamMemberAllowance) {
          return next();
        }
      }
      
      res.status(403).json({ message: 'You do not have permission to access this allowance' });
    } catch (error) {
      console.error('Error checking allowance owner:', error);
      res.status(500).json({ message: 'Error checking permissions' });
    }
  };
};

// Manager authorization middleware
exports.isManager = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const managerRoles = ['ABM', 'RBM', 'ZBM', 'DGM', 'ADMIN', 'SUPER_ADMIN'];
    
    if (!managerRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Manager role required' });
    }
    
    next();
  };
};

// Admin authorization middleware
exports.isAdmin = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const adminRoles = ['ADMIN', 'SUPER_ADMIN'];
    
    if (!adminRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Admin role required' });
    }
    
    next();
  };
};