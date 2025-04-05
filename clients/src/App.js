import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { useAuth } from './contexts/AuthContext.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import Navbar from './components/Navbar.tsx';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import ExpenseList from './pages/ExpenseList.tsx';
import ExpenseDetail from './pages/ExpenseDetail.tsx';
import ExpenseForm from './components/ExpenseForm.tsx';
import UserManagement from './pages/UserManagement.tsx';
import UserDetail from './pages/UserDetail.tsx';
import UserForm from './pages/UserForm.tsx';
import NotFound from './pages/NotFound.tsx';
import Unauthorized from './pages/Unauthorized.tsx';
// Fix the import path to be relative to src
import { UserRole } from './shared/types/user.ts';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

// Remove TypeScript annotation
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/expenses" element={
        <ProtectedRoute>
          <ExpenseList />
        </ProtectedRoute>
      } />
      
      <Route path="/expenses/new" element={
        <ProtectedRoute>
          <ExpenseForm />
        </ProtectedRoute>
      } />
      
      <Route path="/expenses/:id" element={
        <ProtectedRoute>
          <ExpenseDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/users" element={
        <ProtectedRoute allowedRoles={[
          UserRole.SUPER_ADMIN,
          UserRole.ADMIN,
          UserRole.DEPARTMENT_HEAD,
          UserRole.TEAM_LEAD,
          UserRole.SENIOR
        ]}>
          <UserManagement />
        </ProtectedRoute>
      } />
      
      <Route path="/users/new" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
          <UserForm />
        </ProtectedRoute>
      } />
      
      <Route path="/users/:id" element={
        <ProtectedRoute>
          <UserDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/users/:id/edit" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
          <UserForm />
        </ProtectedRoute>
      } />
      
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Remove TypeScript annotation
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div>
            <Navbar />
            <main style={{ padding: '24px' }}>
              <AppRoutes />
            </main>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;