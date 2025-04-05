import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { notFoundStyles } from '../styles/notFoundStyles.ts';

const NotFound: React.FC = () => {
  return (
    <Box sx={notFoundStyles.container}>
      <Typography variant="h1" sx={notFoundStyles.errorCode}>
        404
      </Typography>
      <Typography variant="h4" component="h1" sx={notFoundStyles.title}>
        Page Not Found
      </Typography>
      <Typography sx={notFoundStyles.message}>
        The page you are looking for doesn't exist or has been moved.
      </Typography>
      <Button
        component={Link}
        to="/dashboard"
        variant="contained"
        color="primary"
        sx={notFoundStyles.button}
      >
        Go to Dashboard
      </Button>
    </Box>
  );
};

export default NotFound;