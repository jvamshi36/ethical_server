import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExpense } from '../services/expenseService.tsx';
import { ExpenseType } from '../shared/types/expense.ts';
import { expenseFormStyles } from '../styles/expenseFormStyles.ts';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Button,
  FormHelperText,
  IconButton,
  Chip
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';

const ExpenseForm: React.FC = () => {
  const [type, setType] = useState<ExpenseType>(ExpenseType.DAILY);
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      await createExpense({
        type,
        amount,
        date: new Date(date),
        description,
        attachments
      });
      
      navigate('/expenses');
    } catch (err: any) {
      setError('Failed to create expense. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real application, you would upload the file to a server
    // and get back a URL to store in the attachments array
    // This is a simplified version
    if (e.target.files && e.target.files.length > 0) {
      const newAttachments = [...attachments];
      for (let i = 0; i < e.target.files.length; i++) {
        // In a real app, this would be the URL returned from the server
        newAttachments.push(`file-${Date.now()}-${i}`);
      }
      setAttachments(newAttachments);
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  return (
    <Container sx={expenseFormStyles.container}>
      <Paper sx={expenseFormStyles.paper}>
        <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
          Submit New Expense
        </Typography>
        
        {error && (
          <Box sx={expenseFormStyles.errorContainer}>
            <Typography sx={expenseFormStyles.errorText}>{error}</Typography>
          </Box>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={expenseFormStyles.form}>
          <Box sx={expenseFormStyles.formGrid}>
            <FormControl fullWidth>
              <InputLabel id="expense-type-label">Expense Type</InputLabel>
              <Select
                labelId="expense-type-label"
                id="type"
                value={type}
                label="Expense Type"
                onChange={(e) => setType(e.target.value as ExpenseType)}
                required
              >
                <MenuItem value={ExpenseType.DAILY}>Daily Allowance</MenuItem>
                <MenuItem value={ExpenseType.TRAVEL}>Travel Allowance</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              id="amount"
              label="Amount"
              type="number"
              inputProps={{ step: "0.01" }}
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              required
              fullWidth
            />
            
            <TextField
              id="date"
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            <TextField
              id="description"
              label="Description"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              fullWidth
              sx={expenseFormStyles.fullWidthField}
            />
            
            <Box sx={expenseFormStyles.fullWidthField}>
              <input
                accept="image/*,application/pdf"
                id="attachments"
                type="file"
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <FormControl fullWidth>
                <InputLabel shrink htmlFor="attachments-button">
                  Attachments
                </InputLabel>
                <Box sx={{ mt: 2 }}>
                  <label htmlFor="attachments">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<AttachFileIcon />}
                    >
                      Upload Files
                    </Button>
                  </label>
                </Box>
                {attachments.length > 0 && (
                  <Box sx={expenseFormStyles.attachmentList}>
                    {attachments.map((file, index) => (
                      <Chip
                        key={index}
                        label={`File ${index + 1}`}
                        onDelete={() => removeAttachment(index)}
                        deleteIcon={<CloseIcon />}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>
                )}
                <FormHelperText>
                  {attachments.length > 0 
                    ? `${attachments.length} file(s) attached` 
                    : 'Attach receipts or other supporting documents'}
                </FormHelperText>
              </FormControl>
            </Box>
          </Box>
          
          <Box sx={expenseFormStyles.buttonContainer}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate('/expenses')}
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Expense'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ExpenseForm;