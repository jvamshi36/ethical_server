import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getUserById } from '../services/userService.ts';
import { UserResponse } from '../services/userService.ts';
import { UserRole } from '../shared/types/user.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  CircularProgress, 
  Grid, 
  Avatar, 
  Chip, 
  Alert, 
  IconButton 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { userDetailStyles } from '../styles/userDetailStyles.ts';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await getUserById(id);
        setUser(data);
      } catch (err) {
        setError('Failed to fetch user details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return { bgcolor: '#f3e5f5', color: '#6a1b9a' };
      case UserRole.ADMIN:
        return { bgcolor: '#ffebee', color: '#b71c1c' };
      case UserRole.DEPARTMENT_HEAD:
        return { bgcolor: '#e3f2fd', color: '#0d47a1' };
      case UserRole.TEAM_LEAD:
        return { bgcolor: '#e8f5e9', color: '#1b5e20' };
      case UserRole.SENIOR:
        return { bgcolor: '#fffde7', color: '#f57f17' };
      case UserRole.JUNIOR:
        return { bgcolor: '#fff3e0', color: '#e65100' };
      case UserRole.TRAINEE:
        return { bgcolor: '#f5f5f5', color: '#424242' };
      default:
        return { bgcolor: '#f5f5f5', color: '#424242' };
    }
  };

  if (loading) {
    return (
      <Box sx={userDetailStyles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={userDetailStyles.container}>
        <Box sx={userDetailStyles.errorContainer}>
          <Typography sx={userDetailStyles.errorText}>{error}</Typography>
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container sx={userDetailStyles.container}>
        <Alert severity="warning">User not found</Alert>
      </Container>
    );
  }

  return (
    <Container sx={userDetailStyles.container}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/users')}
          color="primary"
        >
          Back to Users
        </Button>
      </Box>

      <Paper sx={userDetailStyles.paper}>
        <Box sx={userDetailStyles.header}>
          <Typography variant="h5" component="h1" sx={userDetailStyles.headerTitle}>
            User Details
          </Typography>
          {(currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SUPER_ADMIN) && (
            <Button
              component={Link}
              to={`/users/${user.id}/edit`}
              variant="contained"
              color="primary"
            >
              Edit User
            </Button>
          )}
        </Box>

        <Box sx={userDetailStyles.content}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  bgcolor: 'primary.main',
                  fontSize: '3rem'
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={userDetailStyles.section}>
                <Typography variant="h6" sx={userDetailStyles.sectionTitle}>
                  Basic Information
                </Typography>
                <Box sx={userDetailStyles.infoGrid}>
                  <Box sx={userDetailStyles.infoItem}>
                    <Typography variant="body2" sx={userDetailStyles.infoLabel}>
                      Username
                    </Typography>
                    <Typography variant="body1" sx={userDetailStyles.infoValue}>
                      {user.username}
                    </Typography>
                  </Box>
                  <Box sx={userDetailStyles.infoItem}>
                    <Typography variant="body2" sx={userDetailStyles.infoLabel}>
                      Email
                    </Typography>
                    <Typography variant="body1" sx={userDetailStyles.infoValue}>
                      {user.email}
                    </Typography>
                  </Box>
                  <Box sx={userDetailStyles.infoItem}>
                    <Typography variant="body2" sx={userDetailStyles.infoLabel}>
                      Role
                    </Typography>
                    <Chip 
                      label={user.role} 
                      size="small" 
                      sx={{ 
                        ...userDetailStyles.roleBadge,
                        ...getRoleBadgeColor(user.role)
                      }} 
                    />
                  </Box>
                </Box>
              </Box>

              <Box sx={userDetailStyles.section}>
                <Typography variant="h6" sx={userDetailStyles.sectionTitle}>
                  Organization
                </Typography>
                <Box sx={userDetailStyles.infoGrid}>
                  <Box sx={userDetailStyles.infoItem}>
                    <Typography variant="body2" sx={userDetailStyles.infoLabel}>
                      Headquarters
                    </Typography>
                    <Typography variant="body1" sx={userDetailStyles.infoValue}>
                      {user.headquartersId}
                    </Typography>
                  </Box>
                  <Box sx={userDetailStyles.infoItem}>
                    <Typography variant="body2" sx={userDetailStyles.infoLabel}>
                      Department
                    </Typography>
                    <Typography variant="body1" sx={userDetailStyles.infoValue}>
                      {user.departmentId}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserDetail;