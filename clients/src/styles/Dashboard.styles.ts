import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';

export const dashboardStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: theme.spacing(3),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
  },
  title: {
    fontWeight: 'bold',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  userRole: {
    marginLeft: theme.spacing(1),
    padding: theme.spacing(0.5, 1),
    borderRadius: 16,
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    fontSize: '0.75rem',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(3),
    marginBottom: theme.spacing(4),
  },
  statCard: {
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
  },
  statTitle: {
    fontSize: '1rem',
    fontWeight: 500,
    marginBottom: theme.spacing(2),
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  pendingValue: {
    color: theme.palette.warning.main,
  },
  approvedValue: {
    color: theme.palette.success.main,
  },
  rejectedValue: {
    color: theme.palette.error.main,
  },
  tableContainer: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
    overflow: 'hidden',
  },
  tableHeader: {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
  },
  errorAlert: {
    marginBottom: theme.spacing(3),
  },
}));



