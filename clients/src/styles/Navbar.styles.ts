import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    backgroundColor: theme.palette.primary.main,
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  logo: {
    color: theme.palette.common.white,
    fontWeight: 'bold',
    fontSize: '1.25rem',
    textDecoration: 'none',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
  },
  navLink: {
    color: theme.palette.common.white,
    marginLeft: theme.spacing(2),
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
  },
  userAvatar: {
    width: 32,
    height: 32,
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.common.white,
    cursor: 'pointer',
  },
  menuPaper: {
    marginTop: theme.spacing(1),
  },
  userInfo: {
    padding: theme.spacing(1, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  userName: {
    fontWeight: 500,
  },
  userEmail: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },
  userRole: {
    fontSize: '0.75rem',
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(0.25, 0.75),
    borderRadius: 12,
    display: 'inline-block',
    marginTop: theme.spacing(0.5),
  },
  mobileMenuButton: {
    display: 'none',
    [theme.breakpoints.down('md')]: {
      display: 'block',
      color: theme.palette.common.white,
    },
  },
  desktopNav: {
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  mobileNav: {
    width: 250,
  },
  mobileNavItem: {
    padding: theme.spacing(2),
  },
  mobileUserInfo: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}));