import api from './api.tsx';
import { Expense, ExpenseStatus, ExpenseType } from '../shared/types/expense.ts';

export interface ExpenseResponse extends Expense {
  userId: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export const getExpenses = async (): Promise<ExpenseResponse[]> => {
  const response = await api.get('/expenses');
  return response.data;
};

export const getExpenseById = async (id: string): Promise<ExpenseResponse> => {
  const response = await api.get(`/expenses/${id}`);
  return response.data;
};

export const createExpense = async (expenseData: {
  date: Date;
  type: ExpenseType;
  amount: number;
  description: string;
  attachments: string[];
}): Promise<Expense> => {
  const response = await api.post('/expenses', expenseData);
  return response.data.expense;
};

export const approveExpense = async (id: string): Promise<Expense> => {
  const response = await api.put(`/expenses/${id}/approve`);
  return response.data.expense;
};

export const rejectExpense = async (id: string): Promise<Expense> => {
  const response = await api.put(`/expenses/${id}/reject`);
  return response.data.expense;
};