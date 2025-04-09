import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const ErrorPage = ({ errorCode = 404, errorMessage = 'Page Not Found' }) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        backgroundColor: '#121212', // Scuro per modalità dark
        color: '#ffffff', // Testo bianco per contrasto
      }}
    >
      {/* Codice errore */}
      <Typography variant="h1" component="div" gutterBottom>
        {errorCode}
      </Typography>

      {/* Messaggio principale */}
      <Typography variant="h5" gutterBottom>
        {errorMessage}
      </Typography>

      {/* Messaggio descrittivo */}
      <Typography variant="body1" gutterBottom>
        Oops! The page you are looking for does not exist or an error occurred.
      </Typography>

      {/* Pulsante per tornare alla homepage */}
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/')} // Naviga alla homepage
        sx={{ mt: 3 }}
      >
        Go to Homepage
      </Button>
    </Box>
  );
};

export default ErrorPage;
