import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { registerUser, getUserById } from '../services/userService.ts';
import { UserRole } from '../shared/types/user.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
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
  CircularProgress 
} from '@mui/material';
import { userFormStyles } from '../styles/userFormStyles.ts';

const UserForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: UserRole.TRAINEE,
    departmentId: '',
    headquartersId: '',
    dailyAllowanceRate: 0,
    assignedTravelCities: [] as string[]
  });
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchUser(id);
    }
  }, [id]);
  
  const fetchUser = async (userId: string) => {
    if (!userId) {
      setError('User ID is required');
      return;
    }
    
    try {
      setLoading(true);
      const userData = await getUserById(userId);
      
      // Check if userData exists and has the expected structure
      if (!userData) {
        throw new Error('No user data returned');
      }
      
      // Process the assignedTravelCities safely
      const assignedCities = (userData as any).assignedTravelCities || [];
      const processedCities = Array.isArray(assignedCities) 
        ? assignedCities 
        : typeof assignedCities === 'string'
          ? assignedCities.split(',').map(city => city.trim())
          : [];
      
      setFormData({
        ...userData,
        password: '', // Don't populate password field for security
        assignedTravelCities: processedCities,
        // Ensure dailyAllowanceRate is a number
        dailyAllowanceRate: typeof (userData as any).dailyAllowanceRate === 'number'
          ? (userData as any).dailyAllowanceRate 
          : parseFloat((userData as any).dailyAllowanceRate) || 0
      });
    } catch (err) {
      setError('Failed to fetch user data');
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }> | 
       React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name as string;
    const value = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTravelCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cities = e.target.value.split(',').map(city => city.trim()).filter(city => city !== '');
    setFormData(prev => ({
      ...prev,
      assignedTravelCities: cities
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // In a real app, you would have different endpoints for create and update
      // For this example, we're just using the register endpoint
      await registerUser(formData);
      
      navigate('/users');
    } catch (err: any) {
      setError(err?.message || 'Failed to save user. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <Box sx={userFormStyles.loadingContainer}>
        <CircularProgress sx={userFormStyles.spinner} />
      </Box>
    );
  }

  return (
    <Container sx={userFormStyles.container}>
      <Paper sx={userFormStyles.paper}>
        <Box sx={userFormStyles.header}>
          <Typography sx={userFormStyles.headerTitle}>
            {isEditMode ? 'Edit User' : 'Create New User'}
          </Typography>
        </Box>

        {error && (
          <Box sx={userFormStyles.errorContainer}>
            <Typography sx={userFormStyles.errorText}>{error}</Typography>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={userFormStyles.form}>
          <Box sx={userFormStyles.formGrid}>
            <TextField
              id="username"
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              id="email"
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              id="password"
              name="password"
              label={`Password ${isEditMode ? '(Leave blank to keep current)' : ''}`}
              type="password"
              value={formData.password}
              onChange={handleChange}
              required={!isEditMode}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange as any}
                label="Role"
                required
              >
                {Object.values(UserRole).map(role => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              id="departmentId"
              name="departmentId"
              label="Department ID"
              value={formData.departmentId}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              id="headquartersId"
              name="headquartersId"
              label="Headquarters ID"
              value={formData.headquartersId}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              id="dailyAllowanceRate"
              name="dailyAllowanceRate"
              label="Daily Allowance Rate"
              type="number"
              inputProps={{ step: "0.01" }}
              value={formData.dailyAllowanceRate}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              sx={userFormStyles.fullWidthField}
              id="assignedTravelCities"
              name="assignedTravelCities"
              label="Assigned Travel Cities (comma-separated)"
              value={formData.assignedTravelCities.join(', ')}
              onChange={handleTravelCityChange}
              fullWidth
            />
          </Box>

          <Box sx={userFormStyles.buttonContainer}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate('/users')}
              sx={userFormStyles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserForm;