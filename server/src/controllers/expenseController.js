import { AppDataSource } from '../config/database.js';
import { Expense } from '../entities/Expense.js';
import { User } from '../entities/User.js';
import { accessControlService } from '../services/accessControl.js';
import { ExpenseStatus, ExpenseType } from '../../shared/types/expense.js';
import { UserRole } from '../../shared/types/user.js';
import { In } from 'typeorm';

export const createExpense = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { date, type, amount, description, attachments } = req.body;
    
    // Validate input
    if (!date || !type || amount === undefined || !description) {
      return res.status(400).json({ message: 'Date, type, amount, and description are required' });
    }

    // Validate expense type
    if (!Object.values(ExpenseType).includes(type)) {
      return res.status(400).json({ message: 'Invalid expense type' });
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }
    
    const userRepository = AppDataSource.getRepository(User);
    const expenseRepository = AppDataSource.getRepository(Expense);

    const user = await userRepository.findOne({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.headquartersId) {
      return res.status(400).json({ message: 'You must be assigned to a headquarters to create expenses' });
    }

    // Check for daily allowance rate if it's a daily expense
    if (type === ExpenseType.DAILY && (!user.dailyAllowanceRate || user.dailyAllowanceRate <= 0)) {
      return res.status(400).json({ message: 'Your daily allowance rate is not set' });
    }

    // For travel expenses, check if the description contains an assigned travel city
    if (type === ExpenseType.TRAVEL && user.assignedTravelCities && user.assignedTravelCities.length > 0) {
      const isTravelValid = user.assignedTravelCities.some(city => 
        description.toLowerCase().includes(city.toLowerCase())
      );
      
      if (!isTravelValid) {
        return res.status(400).json({ 
          message: 'Travel expense must be for an assigned city', 
          assignedCities: user.assignedTravelCities 
        });
      }
    }

    const expense = expenseRepository.create({
      userId: req.user.id,
      date: new Date(date),
      type,
      amount,
      description,
      attachments: attachments || [],
      headquartersId: user.headquartersId,
      status: ExpenseStatus.PENDING
    });

    await expenseRepository.save(expense);

    res.status(201).json({
      message: 'Expense created successfully',
      expense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getExpenses = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { role, headquartersId, id: userId } = req.user;
    const expenseRepository = AppDataSource.getRepository(Expense);
    const userRepository = AppDataSource.getRepository(User);
    
    // Parse pagination and filtering parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const type = req.query.type;
    const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : undefined;
    const toDate = req.query.toDate ? new Date(req.query.toDate) : undefined;
    const userId_filter = req.query.userId;
    
    const skip = (page - 1) * limit;
    
    // Build the base query
    const queryBuilder = expenseRepository.createQueryBuilder('expense')
      .leftJoinAndSelect('expense.user', 'user')
      .take(limit)
      .skip(skip);
      
    // Apply filters if provided
    if (status) {
      queryBuilder.andWhere('expense.status = :status', { status });
    }
    
    if (type) {
      queryBuilder.andWhere('expense.type = :type', { type });
    }
    
    if (fromDate) {
      queryBuilder.andWhere('expense.date >= :fromDate', { fromDate });
    }
    
    if (toDate) {
      queryBuilder.andWhere('expense.date <= :toDate', { toDate });
    }
    
    // Apply visibility restrictions based on user role
    if (role === UserRole.SUPER_ADMIN) {
      // Super admin can see all expenses
      if (userId_filter) {
        queryBuilder.andWhere('expense.userId = :userId_filter', { userId_filter });
      }
    } 
    else if (role === UserRole.ADMIN || role === UserRole.DEPARTMENT_HEAD) {
      // Admin and Department Head can see expenses from their headquarters
      queryBuilder.andWhere('expense.headquartersId = :headquartersId', { headquartersId });
      
      if (userId_filter) {
        queryBuilder.andWhere('expense.userId = :userId_filter', { userId_filter });
      }
    }
    else if (role === UserRole.TEAM_LEAD) {
      // Team Lead can see their own expenses and expenses from Seniors, Juniors, and Trainees in their headquarters
      const viewableUsers = await userRepository.find({
        where: {
          headquartersId,
          role: In([UserRole.SENIOR, UserRole.JUNIOR, UserRole.TRAINEE])
        },
        select: ['id']
      });
      
      const viewableUserIds = viewableUsers.map(user => user.id);
      viewableUserIds.push(userId); // Include own expenses
      
      queryBuilder.andWhere('expense.userId IN (:...viewableUserIds)', { viewableUserIds });
      
      if (userId_filter) {
        if (!viewableUserIds.includes(userId_filter) && userId_filter !== userId) {
          return res.status(403).json({ message: 'You are not authorized to view this user\'s expenses' });
        }
        queryBuilder.andWhere('expense.userId = :userId_filter', { userId_filter });
      }
    }
    else if (role === UserRole.SENIOR) {
      // Senior can see their own expenses and expenses from Juniors and Trainees in their headquarters
      const viewableUsers = await userRepository.find({
        where: {
          headquartersId,
          role: In([UserRole.JUNIOR, UserRole.TRAINEE])
        },
        select: ['id']
      });
      
      const viewableUserIds = viewableUsers.map(user => user.id);
      viewableUserIds.push(userId); // Include own expenses
      
      queryBuilder.andWhere('expense.userId IN (:...viewableUserIds)', { viewableUserIds });
      
      if (userId_filter) {
        if (!viewableUserIds.includes(userId_filter) && userId_filter !== userId) {
          return res.status(403).json({ message: 'You are not authorized to view this user\'s expenses' });
        }
        queryBuilder.andWhere('expense.userId = :userId_filter', { userId_filter });
      }
    }
    else {
      // Junior and Trainee can only see their own expenses
      queryBuilder.andWhere('expense.userId = :userId', { userId });
    }
    
    // Sort by date descending (newest first)
    queryBuilder.orderBy('expense.date', 'DESC');
    
    // Execute the query
    const [expenses, total] = await queryBuilder.getManyAndCount();
    
    res.json({
      expenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const expenseRepository = AppDataSource.getRepository(Expense);
    const userRepository = AppDataSource.getRepository(User);
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(req.params.id)) {
      return res.status(400).json({ message: 'Invalid expense ID format' });
    }
    
    const expense = await expenseRepository.findOne({
      where: { id: req.params.id },
      relations: ['user']
    });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if the requesting user has permission to view this expense
    const expenseUser = await userRepository.findOne({ where: { id: expense.userId } });
    if (!expenseUser) {
      return res.status(404).json({ message: 'Expense user not found' });
    }

    const canView = accessControlService.canViewExpense(
      req.user.role,
      req.user.headquartersId,
      expenseUser.role,
      expenseUser.headquartersId || ''
    );

    // Users can always view their own expenses
    const isOwnExpense = req.user.id === expense.userId;

    if (!canView && !isOwnExpense) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(expense);
  } catch (error) {
    console.error('Get expense by ID error:', error);
    res.status(500).json({ message: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const approveExpense = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const expenseRepository = AppDataSource.getRepository(Expense);
    const userRepository = AppDataSource.getRepository(User);
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(req.params.id)) {
      return res.status(400).json({ message: 'Invalid expense ID format' });
    }
    
    const expense = await expenseRepository.findOne({ 
      where: { id: req.params.id },
      relations: ['user'] 
    });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Validate expense status
    if (expense.status !== ExpenseStatus.PENDING) {
      return res.status(400).json({ 
        message: `Expense cannot be approved because it is already ${expense.status.toLowerCase()}` 
      });
    }

    // Get the expense owner
    const expenseUser = await userRepository.findOne({ where: { id: expense.userId } });
    if (!expenseUser) {
      return res.status(404).json({ message: 'Expense user not found' });
    }

    // Check if the requesting user has permission to approve this expense
    const canApprove = accessControlService.canApproveExpense(
      req.user.role,
      req.user.headquartersId,
      expenseUser.role,
      expenseUser.headquartersId || ''
    );

    if (!canApprove) {
      return res.status(403).json({ message: 'Access denied: You do not have permission to approve this expense' });
    }

    // Update expense status
    expense.status = ExpenseStatus.APPROVED;
    expense.approverId = req.user.id;
    await expenseRepository.save(expense);

    res.json({
      message: 'Expense approved successfully',
      expense
    });
  } catch (error) {
    console.error('Approve expense error:', error);
    res.status(500).json({ message: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const rejectExpense = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const expenseRepository = AppDataSource.getRepository(Expense);
    const userRepository = AppDataSource.getRepository(User);
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(req.params.id)) {
      return res.status(400).json({ message: 'Invalid expense ID format' });
    }
    
    const expense = await expenseRepository.findOne({ 
      where: { id: req.params.id },
      relations: ['user'] 
    });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Validate expense status
    if (expense.status !== ExpenseStatus.PENDING) {
      return res.status(400).json({ 
        message: `Expense cannot be rejected because it is already ${expense.status.toLowerCase()}` 
      });
    }

    // Get the expense owner
    const expenseUser = await userRepository.findOne({ where: { id: expense.userId } });
    if (!expenseUser) {
      return res.status(404).json({ message: 'Expense user not found' });
    }

    // Check if the requesting user has permission to reject this expense
    const canApprove = accessControlService.canApproveExpense(
      req.user.role,
      req.user.headquartersId,
      expenseUser.role,
      expenseUser.headquartersId || ''
    );

    if (!canApprove) {
      return res.status(403).json({ message: 'Access denied: You do not have permission to reject this expense' });
    }

    // Require rejection reason
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    // Update expense status
    expense.status = ExpenseStatus.REJECTED;
    expense.approverId = req.user.id;
    // Store rejection reason in the description field by appending it
    expense.description = `${expense.description} [REJECTED: ${reason}]`;
    
    await expenseRepository.save(expense);

    res.json({
      message: 'Expense rejected successfully',
      expense
    });
  } catch (error) {
    console.error('Reject expense error:', error);
    res.status(500).json({ message: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};