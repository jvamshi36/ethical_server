export const dashboardStyles = {
  container: {
    padding: '32px 16px'
  },
  header: {
    marginBottom: '32px'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  subtitle: {
    color: '#666',
    marginBottom: '24px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(1, 1fr)',
    gap: '24px',
    marginBottom: '32px',
    '@media (min-width: 600px)': {
      gridTemplateColumns: 'repeat(2, 1fr)'
    },
    '@media (min-width: 960px)': {
      gridTemplateColumns: 'repeat(4, 1fr)'
    }
  },
  statCard: {
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-5px)'
    }
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  statLabel: {
    color: '#666',
    fontSize: '0.875rem'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '16px',
    marginTop: '32px'
  },
  chartContainer: {
    height: '400px',
    marginBottom: '32px'
  },
  recentActivityCard: {
    marginBottom: '24px'
  },
  activityHeader: {
    padding: '16px',
    borderBottom: '1px solid #e0e0e0'
  },
  activityTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold'
  },
  activityList: {
    padding: '0'
  },
  activityItem: {
    borderBottom: '1px solid #f0f0f0',
    '&:last-child': {
      borderBottom: 'none'
    }
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh'
  }
};