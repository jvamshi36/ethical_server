import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Avatar, 
  Menu, 
  MenuItem, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  Divider 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../contexts/AuthContext.tsx';
import { UserRole } from '../shared/types/user.ts';
import { useStyles } from '../styles/Navbar.styles.ts';

const Navbar: React.FC = () => {
  const classes = useStyles();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  const drawer = (
    <div>
      <div className={classes.mobileUserInfo}>
        <Typography variant="subtitle1">{user?.username}</Typography>
        <Typography variant="body2">{user?.email}</Typography>
        <Typography className={classes.userRole}>{user?.role}</Typography>
      </div>
      <Divider />
      <List>
        <ListItem button component={Link} to="/dashboard" onClick={handleDrawerToggle}>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/expenses" onClick={handleDrawerToggle}>
          <ListItemText primary="Expenses" />
        </ListItem>
        {(user?.role === UserRole.SUPER_ADMIN ||
          user?.role === UserRole.ADMIN ||
          user?.role === UserRole.DEPARTMENT_HEAD ||
          user?.role === UserRole.TEAM_LEAD ||
          user?.role === UserRole.SENIOR) && (
          <ListItem button component={Link} to="/users" onClick={handleDrawerToggle}>
            <ListItemText primary="Users" />
          </ListItem>
        )}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemText primary="Sign out" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography
            variant="h6"
            component={Link}
            to="/dashboard"
            className={classes.logo}
          >
            ExpenseManager
          </Typography>
          
          <div className={classes.desktopNav}>
            <Button color="inherit" component={Link} to="/dashboard">
              Dashboard
            </Button>
            <Button color="inherit" component={Link} to="/expenses">
              Expenses
            </Button>
            {(user?.role === UserRole.SUPER_ADMIN ||
              user?.role === UserRole.ADMIN ||
              user?.role === UserRole.DEPARTMENT_HEAD ||
              user?.role === UserRole.TEAM_LEAD ||
              user?.role === UserRole.SENIOR) && (
              <Button color="inherit" component={Link} to="/users">
                Users
              </Button>
            )}
          </div>
          
          <div className={classes.userSection}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              className={classes.mobileMenuButton}
            >
              <MenuIcon />
            </IconButton>
            
            <Avatar 
              className={classes.userAvatar}
              onClick={handleMenuOpen}
            >
              {user?.username.charAt(0).toUpperCase()}
            </Avatar>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              classes={{ paper: classes.menuPaper }}
            >
              <div className={classes.userInfo}>
                <Typography className={classes.userName}>{user?.username}</Typography>
                <Typography className={classes.userEmail}>{user?.email}</Typography>
                <Typography className={classes.userRole}>{user?.role}</Typography>
              </div>
              <MenuItem onClick={handleLogout}>Sign out</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        classes={{ paper: classes.mobileNav }}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;