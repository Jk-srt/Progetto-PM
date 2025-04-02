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
      <Box 
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}
      >
        <Typography variant="h4" component="h1">
          Portfolio Manager Login
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={loginWithGoogle}
          size="large"
          sx={{
            backgroundColor: '#4285F4',
            '&:hover': { backgroundColor: '#357ABD' }
          }}
        >
          Continue with Google
        </Button>

        <Typography variant="body2" color="textSecondary">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;
