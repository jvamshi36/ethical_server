import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { unauthorizedStyles } from '../styles/unauthorizedStyles.ts';

const Unauthorized: React.FC = () => {
  return (
    <Box sx={unauthorizedStyles.container}>
      <Typography variant="h1" sx={unauthorizedStyles.errorCode}>
        403
      </Typography>
      <Typography variant="h4" component="h1" sx={unauthorizedStyles.title}>
        Unauthorized
      </Typography>
      <Typography sx={unauthorizedStyles.message}>
        You don't have permission to access this page.
      </Typography>
      <Button
        component={Link}
        to="/dashboard"
        variant="contained"
        color="primary"
        sx={unauthorizedStyles.button}
      >
        Go to Dashboard
      </Button>
    </Box>
  );
};

export default Unauthorized;