import { Theme } from '@mui/material/styles';

export const userFormStyles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '32px 16px'
  },
  paper: {
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  header: {
    padding: '16px 24px',
    borderBottom: '1px solid #e0e0e0'
  },
  headerTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  errorContainer: {
    padding: '16px 24px',
    backgroundColor: '#ffebee',
    borderBottom: '1px solid #ffcdd2'
  },
  errorText: {
    color: '#c62828'
  },
  form: {
    padding: '24px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(1, 1fr)',
    gap: '24px',
    '@media (min-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)'
    }
  },
  fullWidthField: {
    gridColumn: '1 / -1'
  },
  buttonContainer: {
    marginTop: '32px',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  cancelButton: {
    marginRight: '12px'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  },
  spinner: {
    color: '#3f51b5'
  }
};