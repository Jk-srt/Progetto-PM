// src/pages/LoginPage.js
import React from 'react';
import { useAuth } from '../context/AuthProvider';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import GoogleIcon from '@mui/icons-material/Google';

const LoginPage = () => {
  const { loginWithGoogle } = useAuth();

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Accedi al tuo account
        </Typography>
        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={loginWithGoogle}
          sx={{
            mt: 3,
            backgroundColor: '#4285F4',
            '&:hover': { backgroundColor: '#357ABD' }
          }}
        >
          Accedi con Google
        </Button>
      </Box>
    </Container>
  );
};

export default LoginPage;
