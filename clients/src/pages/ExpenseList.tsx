import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getExpenses, approveExpense, rejectExpense } from '../services/expenseService.tsx';
import { ExpenseResponse } from '../services/expenseService.tsx';
import { ExpenseStatus, ExpenseType } from '../shared/types/expense.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { UserRole } from '../shared/types/user.ts';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  CircularProgress, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid, 
  Chip 
} from '@mui/material';
import { expenseListStyles } from '../styles/expenseListStyles.ts';

const ExpenseList: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<ExpenseType | 'ALL'>('ALL');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses();
      setExpenses(data);
    } catch (err) {
      setError('Failed to fetch expenses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveExpense(id);
      fetchExpenses();
    } catch (err) {
      setError('Failed to approve expense');
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectExpense(id);
      fetchExpenses();
    } catch (err) {
      setError('Failed to reject expense');
      console.error(err);
    }
  };

  const getStatusColor = (status: ExpenseStatus) => {
    switch (status) {
      case ExpenseStatus.APPROVED:
        return { color: 'success.main' };
      case ExpenseStatus.REJECTED:
        return { color: 'error.main' };
      default:
        return { color: 'warning.main' };
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

  const safeExpenses = Array.isArray(expenses) ? expenses : [];
const filteredExpenses = safeExpenses.filter(expense => {
    if (statusFilter !== 'ALL' && expense.status !== statusFilter) {
      return false;
    }
    if (typeFilter !== 'ALL' && expense.type !== typeFilter) {
      return false;
    }
    return true;
  });

  const canApproveOrReject = (expense: ExpenseResponse) => {
    if (expense.status !== ExpenseStatus.PENDING) {
      return false;
    }

    if (user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN) {
      return true;
    }

    if (user?.role === UserRole.DEPARTMENT_HEAD) {
      return true;
    }

    if (user?.role === UserRole.TEAM_LEAD) {
      return [UserRole.SENIOR, UserRole.JUNIOR, UserRole.TRAINEE].includes(expense.userId.role as UserRole);
    }

    if (user?.role === UserRole.SENIOR) {
      return [UserRole.JUNIOR, UserRole.TRAINEE].includes(expense.userId.role as UserRole);
    }

    return false;
  };

  if (loading) {
    return (
      <Box sx={expenseListStyles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={expenseListStyles.container}>
      <Box sx={expenseListStyles.header}>
        <Typography variant="h4" component="h1" sx={expenseListStyles.title}>
          Expenses
        </Typography>
        <Button
          component={Link}
          to="/expenses/new"
          variant="contained"
          color="primary"
        >
          New Expense
        </Button>
      </Box>

      {error && (
        <Box sx={expenseListStyles.errorContainer}>
          <Typography sx={expenseListStyles.errorText}>{error}</Typography>
        </Box>
      )}

      <Paper sx={expenseListStyles.paper}>
        <Box sx={expenseListStyles.filterContainer}>
          <Grid container spacing={2} sx={expenseListStyles.filterForm}>
            <Grid item xs={12} sm={6} md={3} sx={expenseListStyles.filterField}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value as ExpenseStatus | 'ALL')}
                >
                  <MenuItem value="ALL">All Statuses</MenuItem>
                  <MenuItem value={ExpenseStatus.PENDING}>Pending</MenuItem>
                  <MenuItem value={ExpenseStatus.APPROVED}>Approved</MenuItem>
                  <MenuItem value={ExpenseStatus.REJECTED}>Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={expenseListStyles.filterField}>
              <FormControl fullWidth>
                <InputLabel id="type-filter-label">Type</InputLabel>
                <Select
                  labelId="type-filter-label"
                  id="type-filter"
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => setTypeFilter(e.target.value as ExpenseType | 'ALL')}
                >
                  <MenuItem value="ALL">All Types</MenuItem>
                  <MenuItem value={ExpenseType.DAILY}>Daily Allowance</MenuItem>
                  <MenuItem value={ExpenseType.TRAVEL}>Travel Allowance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        <TableContainer sx={expenseListStyles.tableContainer}>
          <Table sx={expenseListStyles.table}>
            <TableHead sx={expenseListStyles.tableHead}>
              <TableRow>
                <TableCell sx={expenseListStyles.tableHeadCell}>Date</TableCell>
                <TableCell sx={expenseListStyles.tableHeadCell}>Type</TableCell>
                <TableCell sx={expenseListStyles.tableHeadCell}>Amount</TableCell>
                <TableCell sx={expenseListStyles.tableHeadCell}>Status</TableCell>
                <TableCell sx={expenseListStyles.tableHeadCell}>Submitted By</TableCell>
                <TableCell sx={expenseListStyles.tableHeadCell}>Description</TableCell>
                <TableCell sx={expenseListStyles.tableHeadCell}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="textSecondary">No expenses found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{formatDate(expense.date.toString())}</TableCell>
                    <TableCell>
                      <Chip 
                        label={expense.type === ExpenseType.DAILY ? 'Daily Allowance' : 'Travel Allowance'} 
                        size="small"
                        color={expense.type === ExpenseType.DAILY ? 'primary' : 'secondary'}
                        variant="outlined"
                        sx={expenseListStyles.typeBadge}
                      />
                    </TableCell>
                    <TableCell>{formatCurrency(expense.amount)}</TableCell>
                    <TableCell>
                      <Typography sx={getStatusColor(expense.status)}>
                        {expense.status}
                      </Typography>
                    </TableCell>
                    <TableCell>{expense.userId.username}</TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {expense.description}
                    </TableCell>
                    <TableCell>
                      <Button
                        component={Link}
                        to={`/expenses/${expense.id}`}
                        color="primary"
                        sx={expenseListStyles.actionButton}
                      >
                        View
                      </Button>
                      {canApproveOrReject(expense) && (
                        <>
                          <Button
                            onClick={() => handleApprove(expense.id)}
                            color="success"
                            sx={expenseListStyles.actionButton}
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(expense.id)}
                            color="error"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default ExpenseList;