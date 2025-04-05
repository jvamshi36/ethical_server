export const expenseDetailStyles = {
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
    padding: '24px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  content: {
    padding: '24px'
  },
  section: {
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#3f51b5'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(1, 1fr)',
    gap: '16px',
    '@media (min-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)'
    }
  },
  infoItem: {
    marginBottom: '16px'
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#666',
    marginBottom: '4px'
  },
  infoValue: {
    fontSize: '1rem'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: 'medium'
  },
  typeBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: 'medium'
  },
  attachmentSection: {
    marginTop: '24px'
  },
  attachmentList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px'
  },
  attachmentItem: {
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  },
  errorContainer: {
    padding: '16px',
    backgroundColor: '#ffebee',
    borderRadius: '4px',
    marginBottom: '16px'
  },
  errorText: {
    color: '#c62828'
  }
};