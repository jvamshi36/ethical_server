export enum ExpenseType {
  DAILY = 'DAILY',
  TRAVEL = 'TRAVEL'
}

export enum ExpenseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Expense {
  id: string;
  userId: string;
  date: Date;
  type: ExpenseType;
  amount: number;
  status: ExpenseStatus;
  approverId?: string;
  description: string;
  attachments: string[]; // URLs to stored files
  headquartersId: string;
  createdAt: Date;
  updatedAt: Date;
}