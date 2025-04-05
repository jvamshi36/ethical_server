export const expenseFormStyles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '32px 16px'
  },
  paper: {
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '24px'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '24px'
  },
  form: {
    width: '100%'
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
  fileInput: {
    display: 'none'
  },
  fileInputLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  attachmentList: {
    marginTop: '16px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  attachmentItem: {
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.875rem'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '32px'
  },
  errorContainer: {
    padding: '16px',
    backgroundColor: '#ffebee',
    borderRadius: '4px',
    marginBottom: '24px'
  },
  errorText: {
    color: '#c62828'
  }
};