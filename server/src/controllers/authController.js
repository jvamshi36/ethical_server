import { AppDataSource } from '../config/database.js';
import { User } from '../entities/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRole } from '../../shared/types/user.js';
import { Department } from '../entities/Department.js';
import { Headquarters } from '../entities/Headquarters.js';

export const register = async (req, res) => {
  try {
    const { 
      username, 
      email, 
      password, 
      role, 
      departmentId, 
      headquartersId, 
      dailyAllowanceRate, 
      assignedTravelCities 
    } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const departmentRepository = AppDataSource.getRepository(Department);
    const headquartersRepository = AppDataSource.getRepository(Headquarters);

    // Check if user already exists
    const existingUser = await userRepository.findOne({ 
      where: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate department and headquarters if provided
    if (departmentId) {
      const departmentExists = await departmentRepository.findOne({ where: { id: departmentId } });
      if (!departmentExists) {
        return res.status(400).json({ message: 'Department not found' });
      }
    }

    if (headquartersId) {
      const headquartersExists = await headquartersRepository.findOne({ where: { id: headquartersId } });
      if (!headquartersExists) {
        return res.status(400).json({ message: 'Headquarters not found' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = userRepository.create({
      username,
      email,
      password: hashedPassword,
      role: role || UserRole.TRAINEE,
      departmentId,
      headquartersId,
      dailyAllowanceRate: dailyAllowanceRate || 0,
      assignedTravelCities: assignedTravelCities || []
    });

    await userRepository.save(user);

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        headquartersId: user.headquartersId 
      },
      jwtSecret,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        headquartersId: user.headquartersId,
        departmentId: user.departmentId
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const userRepository = AppDataSource.getRepository(User);

    // Find user by email and include password field which is normally excluded
    const user = await userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        headquartersId: user.headquartersId 
      },
      jwtSecret,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        headquartersId: user.headquartersId,
        departmentId: user.departmentId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};