import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Alert 
} from '@mui/material';
import { loginStyles } from '../styles/loginStyles.ts';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const from = state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError('Failed to log in. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={loginStyles.container}>
      <Paper sx={loginStyles.paper}>
        <Box sx={loginStyles.logo}>
          <Typography sx={loginStyles.logoText}>
            Ethical Expense
          </Typography>
        </Box>
        
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          Sign in to your account
        </Typography>
        
        {error && (
          <Box sx={loginStyles.errorContainer}>
            <Typography sx={loginStyles.errorText}>{error}</Typography>
          </Box>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={loginStyles.form}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={loginStyles.textField}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={loginStyles.textField}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={loginStyles.submitButton}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
          
          <Box sx={loginStyles.forgotPassword}>
            <Typography variant="body2" color="textSecondary">
              Forgot your password? Contact your administrator.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;