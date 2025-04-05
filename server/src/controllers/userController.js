import { AppDataSource } from '../config/database.js';
import { User } from '../entities/User.js';
import { accessControlService } from '../services/accessControl.js';
import { UserRole } from '../../shared/types/user.js';
import { In } from 'typeorm';

export const getUsers = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { role, headquartersId } = req.user;
    const userRepository = AppDataSource.getRepository(User);
    
    // Parse pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const roleFilter = req.query.role;
    const departmentId = req.query.departmentId;
    
    const skip = (page - 1) * limit;
    
    // Build the base query
    const queryBuilder = userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.department', 'department')
      .leftJoinAndSelect('user.headquarters', 'headquarters')
      .select([
        'user.id', 
        'user.username', 
        'user.email', 
        'user.role', 
        'user.departmentId', 
        'user.headquartersId', 
        'user.dailyAllowanceRate', 
        'user.assignedTravelCities', 
        'user.createdAt', 
        'user.updatedAt',
        'department.id',
        'department.name',
        'headquarters.id',
        'headquarters.name',
        'headquarters.location'
      ])
      .take(limit)
      .skip(skip);
    
    // Apply role filter if provided
    if (roleFilter) {
      queryBuilder.andWhere('user.role = :roleFilter', { roleFilter });
    }
    
    // Apply department filter if provided
    if (departmentId) {
      queryBuilder.andWhere('user.departmentId = :departmentId', { departmentId });
    }

    // Apply visibility restrictions based on user role
    if (role === UserRole.SUPER_ADMIN) {
      // Super admin can see all users - no restrictions needed
    } 
    else if (role === UserRole.ADMIN || role === UserRole.DEPARTMENT_HEAD) {
      // Admin and Department Head can see all users in their headquarters
      queryBuilder.andWhere('user.headquartersId = :headquartersId', { headquartersId });
    }
    else if (role === UserRole.TEAM_LEAD) {
      // Team Lead can see Seniors, Juniors, and Trainees in their headquarters
      queryBuilder
        .andWhere('user.headquartersId = :headquartersId', { headquartersId })
        .andWhere('user.role IN (:...viewableRoles)', { 
          viewableRoles: [UserRole.SENIOR, UserRole.JUNIOR, UserRole.TRAINEE]
        });
    }
    else if (role === UserRole.SENIOR) {
      // Senior can see Juniors and Trainees in their headquarters
      queryBuilder
        .andWhere('user.headquartersId = :headquartersId', { headquartersId })
        .andWhere('user.role IN (:...viewableRoles)', { 
          viewableRoles: [UserRole.JUNIOR, UserRole.TRAINEE]
        });
    }
    else {
      // Junior and Trainee can't see other users - return only the current user
      queryBuilder.andWhere('user.id = :userId', { userId: req.user.id });
    }
    
    // Execute the query
    const [users, total] = await queryBuilder.getManyAndCount();
    
    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getUserById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const targetUser = await userRepository.findOne({
      where: { id: req.params.id },
      relations: ['department', 'headquarters'],
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        departmentId: true,
        headquartersId: true,
        dailyAllowanceRate: true,
        assignedTravelCities: true,
        createdAt: true,
        updatedAt: true,
        department: {
          id: true,
          name: true
        },
        headquarters: {
          id: true,
          name: true,
          location: true
        }
      }
    });
    
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Users can always view themselves
    const isSelf = req.user.id === req.params.id;
    
    if (!isSelf) {
      // Check if the requesting user has permission to view this user
      const canView = accessControlService.canViewUser(
        req.user.role,
        req.user.headquartersId,
        targetUser.role,
        targetUser.headquartersId || ''
      );

      if (!canView) {
        return res.status(403).json({ message: 'Access denied: You do not have permission to view this user' });
      }
    }

    res.json(targetUser);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Add a new endpoint to get the current user's profile
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: req.user.id },
      relations: ['department', 'headquarters'],
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        departmentId: true,
        headquartersId: true,
        dailyAllowanceRate: true,
        assignedTravelCities: true,
        createdAt: true,
        updatedAt: true,
        department: {
          id: true,
          name: true
        },
        headquarters: {
          id: true,
          name: true,
          location: true
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};