import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext.tsx';
import { getExpenses } from '../services/expenseService.tsx';
import { ExpenseResponse } from '../services/expenseService.tsx';
import { ExpenseStatus, ExpenseType } from '../shared/types/expense.ts';
import { UserRole } from '../shared/types/user.ts';
import {dashboardStyles } from '../styles/Dashboard.styles.ts';

const Dashboard: React.FC = () => {
  const classes = dashboardStyles();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await getExpenses();
        setExpenses(data);
      } catch (err) {
        setError('Failed to fetch expenses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const getStatusColor = (status: ExpenseStatus) => {
    switch (status) {
      case ExpenseStatus.APPROVED:
        return classes.approvedValue;
      case ExpenseStatus.REJECTED:
        return classes.rejectedValue;
      default:
        return classes.pendingValue;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes.container}>
        <Alert severity="error" className={classes.errorAlert}>
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Typography variant="h4" className={classes.title}>
          Dashboard
        </Typography>
        <div className={classes.userInfo}>
          <Typography variant="subtitle1">
            Welcome, {user?.username}
          </Typography>
          <Typography variant="body2" className={classes.userRole}>
            {user?.role}
          </Typography>
        </div>
      </div>

      <div className={classes.statsContainer}>
        <Paper className={classes.statCard}>
          <Typography className={classes.statTitle}>
            Pending Expenses
          </Typography>
          <Typography className={`${classes.statValue} ${classes.pendingValue}`}>
            {safeExpenses.filter(e => e.status === ExpenseStatus.PENDING).length}
          </Typography>
        </Paper>
        <Paper className={classes.statCard}>
          <Typography className={classes.statTitle}>
            Approved Expenses
          </Typography>
          <Typography className={`${classes.statValue} ${classes.approvedValue}`}>
            {safeExpenses.filter(e => e.status === ExpenseStatus.APPROVED).length}
          </Typography>
        </Paper>
        <Paper className={classes.statCard}>
          <Typography className={classes.statTitle}>
            Rejected Expenses
          </Typography>
          <Typography className={`${classes.statValue} ${classes.rejectedValue}`}>
            {safeExpenses.filter(e => e.status === ExpenseStatus.REJECTED).length}
          </Typography>
        </Paper>
      </div>

      <div className={classes.tableContainer}>
        <div className={classes.tableHeader}>
          <Typography variant="h6">Recent Expenses</Typography>
        </div>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                {(user?.role === UserRole.TEAM_LEAD || 
                  user?.role === UserRole.DEPARTMENT_HEAD || 
                  user?.role === UserRole.ADMIN || 
                  user?.role === UserRole.SUPER_ADMIN) && (
                  <TableCell>Submitted By</TableCell>
                )}
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {safeExpenses.slice(0, 10).map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    {formatDate(expense.date.toString())}
                  </TableCell>
                  <TableCell>
                    {expense.type === ExpenseType.DAILY ? 'Daily Allowance' : 'Travel Allowance'}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell>
                    <Typography className={getStatusColor(expense.status)}>
                      {expense.status}
                    </Typography>
                  </TableCell>
                  {(user?.role === UserRole.TEAM_LEAD || 
                    user?.role === UserRole.DEPARTMENT_HEAD || 
                    user?.role === UserRole.ADMIN || 
                    user?.role === UserRole.SUPER_ADMIN) && (
                    <TableCell>
                      {expense.userId.username}
                    </TableCell>
                  )}
                  <TableCell>
                    {expense.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default Dashboard;