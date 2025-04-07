const User = require('../models/user.model');

// Get all users with optional filters
exports.getUsers = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      role: req.query.role,
      department: req.query.department,
      headquarters: req.query.headquarters,
      isActive: req.query.isActive === 'true' ? true : 
                req.query.isActive === 'false' ? false : 
                undefined
    };
    
    const users = await User.findAll(filters);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { username, password, email, fullName, role, department, headquarters, reportingManagerId } = req.body;
    
    // Check if username or email already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Create user
    const user = await User.create({
      username,
      password,
      email,
      fullName,
      role,
      department,
      headquarters,
      reportingManagerId
    });
    
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      department: user.department,
      headquarters: user.headquarters,
      reportingManagerId: user.reporting_manager_id
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { email, fullName, role, department, headquarters, reportingManagerId, isActive } = req.body;
    
    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user
    const updatedUser = await User.update(req.params.id, {
      email,
      fullName,
      role,
      department,
      headquarters,
      reportingManagerId,
      isActive
    });
    
    res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.full_name,
        role: updatedUser.role,
        department: updatedUser.department,
        headquarters: updatedUser.headquarters,
        reportingManagerId: updatedUser.reporting_manager_id,
        isActive: updatedUser.is_active
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  };
  
  // Delete user (soft delete)
  exports.deleteUser = async (req, res) => {
    try {
      // Check if user exists
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Delete user
      await User.delete(req.params.id);
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  };
  
  // Reset user password
  exports.resetPassword = async (req, res) => {
    try {
      const { newPassword } = req.body;
      
      // Check if user exists
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update password
      await User.updatePassword(req.params.id, newPassword);
      
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ message: 'Failed to reset password' });
    }
  };
  
  // Get team members
  exports.getTeamMembers = async (req, res) => {
    try {
      const teamMembers = await User.getTeamMembers(req.user.id);
      res.json(teamMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      res.status(500).json({ message: 'Failed to fetch team members' });
    }
  };
  
  // Update team members
  exports.updateTeam = async (req, res) => {
    try {
      const { teamMembers } = req.body;
      
      // Get current team members
      const currentTeam = await User.getTeamMembers(req.params.id);
      const currentTeamIds = currentTeam.map(member => member.id);
      
      // Add new team members
      for (const memberId of teamMembers) {
        if (!currentTeamIds.includes(memberId)) {
          await User.addTeamMember(req.params.id, memberId);
        }
      }
      
      // Remove team members not in the new list
      for (const currentMemberId of currentTeamIds) {
        if (!teamMembers.includes(currentMemberId)) {
          await User.removeTeamMember(req.params.id, currentMemberId);
        }
      }
      
      res.json({ message: 'Team updated successfully' });
    } catch (error) {
      console.error('Error updating team:', error);
      res.status(500).json({ message: 'Failed to update team' });
    }
  };
  
  // Get user hierarchy
  exports.getUserHierarchy = async (req, res) => {
    try {
      const hierarchy = await User.getUserHierarchy();
      res.json(hierarchy);
    } catch (error) {
      console.error('Error fetching user hierarchy:', error);
      res.status(500).json({ message: 'Failed to fetch user hierarchy' });
    }
  };
  
  // Update user status
  exports.updateUserStatus = async (req, res) => {
    try {
      const { isActive } = req.body;
      
      // Check if user exists
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update user status
      const updatedUser = await User.update(req.params.id, {
        ...user,
        isActive
      });
      
      res.json({
        id: updatedUser.id,
        isActive: updatedUser.is_active
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({ message: 'Failed to update user status' });
    }
  };