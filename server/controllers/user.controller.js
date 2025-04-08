const User = require('../models/user.model');
const bcrypt = require('bcrypt');

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
    
    // Validate required fields
    if (!username || !password || !email || !fullName || !role || !department || !headquarters) {
      return res.status(400).json({ 
        message: 'Username, password, email, fullName, role, department, and headquarters are required' 
      });
    }
    
    // Check if username or email already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Check if email already exists
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Check reporting manager requirement based on role
    if (!['DGM', 'ZBM', 'ADMIN', 'SUPER_ADMIN'].includes(role) && !reportingManagerId) {
      return res.status(400).json({ 
        message: 'Reporting manager is required for this role' 
      });
    }
    
    // If reportingManagerId is provided, verify it exists
    if (reportingManagerId) {
      const manager = await User.findById(reportingManagerId);
      if (!manager) {
        return res.status(400).json({ message: 'Invalid reporting manager ID' });
      }
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = await User.create({
      username,
      password: hashedPassword,
      email,
      fullName,
      role,
      department,
      headquarters,
      reportingManagerId: reportingManagerId || null,
      isActive: true // Default to active
    });
    
    // Return user data without password
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      department: user.department,
      headquarters: user.headquarters,
      reportingManagerId: user.reporting_manager_id,
      isActive: user.is_active
    };
    
    res.status(201).json(userData);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user: ' + error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { email, fullName, role, department, headquarters, reportingManagerId, isActive } = req.body;
    
    // Validate required fields
    if (!email || !fullName || !role || !department || !headquarters) {
      return res.status(400).json({ 
        message: 'Email, fullName, role, department, and headquarters are required' 
      });
    }
    
    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check reporting manager requirement based on role
    if (!['DGM', 'ZBM', 'ADMIN', 'SUPER_ADMIN'].includes(role) && !reportingManagerId) {
      return res.status(400).json({ 
        message: 'Reporting manager is required for this role' 
      });
    }
    
    // If reportingManagerId is provided, verify it exists and is not the same as the user being updated
    if (reportingManagerId) {
      if (reportingManagerId === req.params.id) {
        return res.status(400).json({ message: 'User cannot be their own reporting manager' });
      }
      
      const manager = await User.findById(reportingManagerId);
      if (!manager) {
        return res.status(400).json({ message: 'Invalid reporting manager ID' });
      }
    }
    
    // Update user
    const updatedUser = await User.update(req.params.id, {
      email,
      fullName,
      role,
      department,
      headquarters,
      reportingManagerId: reportingManagerId || null,
      isActive: isActive !== undefined ? isActive : user.is_active
    });
    
    // Return updated user data
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
    res.status(500).json({ message: 'Failed to update user: ' + error.message });
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
    
    // Delete user (soft delete by setting is_active to false)
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
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }
    
    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await User.updatePassword(req.params.id, hashedPassword);
    
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
    
    if (!Array.isArray(teamMembers)) {
      return res.status(400).json({ message: 'teamMembers must be an array' });
    }
    
    // Get current team members
    const currentTeam = await User.getTeamMembers(req.params.id);
    const currentTeamIds = currentTeam.map(member => member.id.toString());
    
    // Add new team members
    for (const memberId of teamMembers) {
      if (!currentTeamIds.includes(memberId.toString())) {
        await User.addTeamMember(req.params.id, memberId);
      }
    }
    
    // Remove team members not in the new list
    for (const currentMemberId of currentTeamIds) {
      if (!teamMembers.map(id => id.toString()).includes(currentMemberId)) {
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
    
    if (isActive === undefined) {
      return res.status(400).json({ message: 'isActive field is required' });
    }
    
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

// Find user by email - useful for checking duplicate emails
exports.findByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ message: 'Email parameter is required' });
    }
    
    const user = await User.findByEmail(email);
    
    if (user) {
      return res.json({ exists: true, userId: user.id });
    }
    
    res.json({ exists: false });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ message: 'Failed to check email' });
  }
};

// Get managers for dropdown
exports.getManagers = async (req, res) => {
  try {
    const { role } = req.query;
    
    let managerRoles = [];
    
    if (['BE', 'BM', 'SBM'].includes(role)) {
      managerRoles = ['ABM', 'RBM'];
    } else if (['ABM', 'RBM'].includes(role)) {
      managerRoles = ['ZBM', 'DGM'];
    } else {
      managerRoles = ['ZBM', 'DGM', 'ADMIN', 'SUPER_ADMIN'];
    }
    
    const managers = await User.findByRoles(managerRoles);
    
    res.json(managers);
  } catch (error) {
    console.error('Error fetching managers:', error);
    res.status(500).json({ message: 'Failed to fetch managers' });
  }
};