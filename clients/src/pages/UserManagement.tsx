import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUsers } from '../services/userService.ts';
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
  Chip, 
  Alert 
} from '@mui/material';
import { userManagementStyles } from '../styles/userManagementStyles.ts';

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getUsers();
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format: expected array');
        }
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
        console.error(err);
        setUsers([]); // Reset to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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

  const filteredUsers = users.filter(user => {
    if (roleFilter !== 'ALL' && user.role !== roleFilter) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <Box sx={userManagementStyles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={userManagementStyles.container}>
      <Box sx={userManagementStyles.header}>
        <Typography variant="h4" component="h1" sx={userManagementStyles.title}>
          User Management
        </Typography>
        {(currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SUPER_ADMIN) && (
          <Button
            component={Link}
            to="/users/new"
            variant="contained"
            color="primary"
          >
            Add User
          </Button>
        )}
      </Box>

      {error && (
        <Box sx={userManagementStyles.errorContainer}>
          <Typography sx={userManagementStyles.errorText}>{error}</Typography>
        </Box>
      )}

      <Paper sx={userManagementStyles.paper}>
        <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
          <FormControl fullWidth>
            <InputLabel id="role-filter-label">Filter by Role</InputLabel>
            <Select
              labelId="role-filter-label"
              id="role-filter"
              value={roleFilter}
              label="Filter by Role"
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
            >
              <MenuItem value="ALL">All Roles</MenuItem>
              {Object.values(UserRole).map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <TableContainer sx={userManagementStyles.tableContainer}>
          <Table sx={userManagementStyles.table}>
            <TableHead sx={userManagementStyles.tableHead}>
              <TableRow>
                <TableCell sx={userManagementStyles.tableHeadCell}>Username</TableCell>
                <TableCell sx={userManagementStyles.tableHeadCell}>Email</TableCell>
                <TableCell sx={userManagementStyles.tableHeadCell}>Role</TableCell>
                <TableCell sx={userManagementStyles.tableHeadCell}>Headquarters</TableCell>
                <TableCell sx={userManagementStyles.tableHeadCell}>Department</TableCell>
                <TableCell sx={userManagementStyles.tableHeadCell}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="textSecondary">No users found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        size="small" 
                        sx={{ 
                          ...userManagementStyles.roleBadge,
                          ...getRoleBadgeColor(user.role)
                        }} 
                      />
                    </TableCell>
                    <TableCell>{user.headquartersId}</TableCell>
                    <TableCell>{user.departmentId}</TableCell>
                    <TableCell>
                      <Button
                        component={Link}
                        to={`/users/${user.id}`}
                        color="primary"
                        sx={userManagementStyles.actionButton}
                      >
                        View
                      </Button>
                      {(currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SUPER_ADMIN) && (
                        <Button
                          component={Link}
                          to={`/users/${user.id}/edit`}
                          color="success"
                        >
                          Edit
                        </Button>
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

export default UserManagement;