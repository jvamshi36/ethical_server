import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExpenseById, approveExpense, rejectExpense } from '../services/expenseService.tsx';
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
  Grid, 
  Chip, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Alert 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { expenseDetailStyles } from '../styles/expenseDetailStyles.ts';

const ExpenseDetail: React.FC = () => {
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expense, setExpense] = useState<ExpenseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchExpense = async () => {
      try {
        setLoading(true);
        const data = await getExpenseById(id);
        setExpense(data);
      } catch (err) {
        setError('Failed to fetch expense details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;

    try {
      await approveExpense(id);
      const updatedExpense = await getExpenseById(id);
      setExpense(updatedExpense);
    } catch (err) {
      setError('Failed to approve expense');
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!id) return;

    try {
      await rejectExpense(id);
      const updatedExpense = await getExpenseById(id);
      setExpense(updatedExpense);
    } catch (err) {
      setError('Failed to reject expense');
      console.error(err);
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

  const getStatusColor = (status: ExpenseStatus) => {
    switch (status) {
      case ExpenseStatus.APPROVED:
        return { bgcolor: '#e8f5e9', color: '#1b5e20' };
      case ExpenseStatus.REJECTED:
        return { bgcolor: '#ffebee', color: '#b71c1c' };
      default:
        return { bgcolor: '#fff8e1', color: '#f57f17' };
    }
  };

  const canApproveOrReject = () => {
    if (!expense || expense.status !== ExpenseStatus.PENDING) {
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
      <Box sx={expenseDetailStyles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={expenseDetailStyles.container}>
        <Box sx={expenseDetailStyles.errorContainer}>
          <Typography sx={expenseDetailStyles.errorText}>{error}</Typography>
        </Box>
      </Container>
    );
  }

  if (!expense) {
    return (
      <Container sx={expenseDetailStyles.container}>
        <Alert severity="warning">Expense not found</Alert>
      </Container>
    );
  }

  return (
    <Container sx={expenseDetailStyles.container}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/expenses')}
          color="primary"
        >
          Back to Expenses
        </Button>
      </Box>

      <Paper sx={expenseDetailStyles.paper}>
        <Box sx={expenseDetailStyles.header}>
          <Typography variant="h5" component="h1" sx={expenseDetailStyles.headerTitle}>
            Expense Details
          </Typography>
          <Chip 
            label={expense.status} 
            sx={{ 
              ...expenseDetailStyles.statusBadge,
              ...getStatusColor(expense.status)
            }} 
          />
        </Box>

        <Box sx={expenseDetailStyles.content}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={expenseDetailStyles.section}>
                <Typography variant="h6" sx={expenseDetailStyles.sectionTitle}>
                  Basic Information
                </Typography>
                <Box sx={expenseDetailStyles.infoGrid}>
                  <Box sx={expenseDetailStyles.infoItem}>
                    <Typography variant="body2" sx={expenseDetailStyles.infoLabel}>
                      Type
                    </Typography>
                    <Typography variant="body1" sx={expenseDetailStyles.infoValue}>
                      {expense.type === ExpenseType.DAILY ? 'Daily Allowance' : 'Travel Allowance'}
                    </Typography>
                  </Box>
                  <Box sx={expenseDetailStyles.infoItem}>
                    <Typography variant="body2" sx={expenseDetailStyles.infoLabel}>
                      Amount
                    </Typography>
                    <Typography variant="body1" sx={expenseDetailStyles.infoValue}>
                      {formatCurrency(expense.amount)}
                    </Typography>
                  </Box>
                  <Box sx={expenseDetailStyles.infoItem}>
                    <Typography variant="body2" sx={expenseDetailStyles.infoLabel}>
                      Date
                    </Typography>
                    <Typography variant="body1" sx={expenseDetailStyles.infoValue}>
                      {formatDate(expense.date.toString())}
                    </Typography>
                  </Box>
                  <Box sx={expenseDetailStyles.infoItem}>
                    <Typography variant="body2" sx={expenseDetailStyles.infoLabel}>
                      Submitted By
                    </Typography>
                    <Typography variant="body1" sx={expenseDetailStyles.infoValue}>
                      {expense.userId.username}
                    </Typography>
                  </Box>
                  <Box sx={expenseDetailStyles.infoItem}>
                    <Typography variant="body2" sx={expenseDetailStyles.infoLabel}>
                      Submitted On
                    </Typography>
                    <Typography variant="body1" sx={expenseDetailStyles.infoValue}>
                      {formatDate(expense.createdAt.toString())}
                    </Typography>
                  </Box>
                  {expense.approverId && (
                    <Box sx={expenseDetailStyles.infoItem}>
                      <Typography variant="body2" sx={expenseDetailStyles.infoLabel}>
                        Processed By
                      </Typography>
                      <Typography variant="body1" sx={expenseDetailStyles.infoValue}>
                        {expense.approverId}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={expenseDetailStyles.section}>
                <Typography variant="h6" sx={expenseDetailStyles.sectionTitle}>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {expense.description}
                </Typography>
              </Box>

              {expense.attachments && expense.attachments.length > 0 && (
                <Box sx={expenseDetailStyles.attachmentSection}>
                  <Typography variant="h6" sx={expenseDetailStyles.sectionTitle}>
                    Attachments
                  </Typography>
                  <List>
                    {expense.attachments.map((attachment, index) => (
                      <ListItem key={index} sx={expenseDetailStyles.attachmentItem}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <AttachFileIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`Attachment ${index + 1}`}
                          primaryTypographyProps={{ color: 'primary' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>

        {canApproveOrReject() && (
          <Box sx={{ 
            p: 3, 
            borderTop: '1px solid #e0e0e0', 
            bgcolor: '#f5f5f5',
            ...expenseDetailStyles.buttonContainer
          }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                onClick={handleApprove}
                variant="contained"
                color="success"
              >
                Approve
              </Button>
              <Button
                onClick={handleReject}
                variant="contained"
                color="error"
              >
                Reject
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ExpenseDetail;