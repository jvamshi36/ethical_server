const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../config/config');

// User login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username
    const user = await User.findByUsername(username);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is inactive' });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate tokens
    const accessToken = jwt.sign(
      { 
        userId: user.id,
        username: user.username,
        role: user.role,
        headquarters: user.headquarters
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRATION }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      config.REFRESH_TOKEN_SECRET,
      { expiresIn: config.REFRESH_TOKEN_EXPIRATION }
    );
    
    // Return user information and tokens
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        department: user.department,
        headquarters: user.headquarters
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);
    
    // Get user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    // Generate new access token
    const accessToken = jwt.sign(
      { 
        userId: user.id,
        username: user.username,
        role: user.role,
        headquarters: user.headquarters
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRATION }
    );
    
    res.json({ accessToken });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expired' });
    }
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// Logout
exports.logout = (req, res) => {
  // Client-side should remove tokens
  res.json({ message: 'Logged out successfully' });
};