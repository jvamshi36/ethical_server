import * as express from 'express';
import { 
  createExpense, 
  getExpenses, 
  getExpenseById, 
  approveExpense, 
  rejectExpense 
} from '../controllers/expenseController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.post('/', authenticate, createExpense);
router.get('/', authenticate, getExpenses);
router.get('/:id', authenticate, getExpenseById);
router.put('/:id/approve', authenticate, approveExpense);
router.put('/:id/reject', authenticate, rejectExpense);

export default router;