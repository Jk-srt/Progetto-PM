import React, { useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import GoogleIcon from '@mui/icons-material/Google';
import EmailIcon from '@mui/icons-material/Email';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';

const LoginPage = () => {
    const { loginWithGoogle, loginWithEmailPassword, registerWithEmailPassword } = useAuth();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setError('');
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setError('');
            await loginWithGoogle();
            navigate('/dashboard');
        } catch (error) {
            setError('Errore durante il login con Google: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            await loginWithEmailPassword(email, password);
            navigate('/dashboard');
        } catch (error) {
            setError('Errore durante il login: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            await registerWithEmailPassword(email, password, displayName);
            navigate('/dashboard');
        } catch (error) {
            setError('Errore durante la registrazione: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

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
                    Portfolio Manager
                </Typography>

                <Tabs value={tabValue} onChange={handleTabChange} aria-label="login tabs">
                    <Tab label="Login" />
                    <Tab label="Registrati" />
                </Tabs>

                {error && (
                    <Alert severity="error" sx={{ width: '100%' }}>
                        {error}
                    </Alert>
                )}

                <Button
                    variant="contained"
                    startIcon={<GoogleIcon />}
                    onClick={handleGoogleLogin}
                    size="large"
                    disabled={loading}
                    sx={{
                        backgroundColor: '#4285F4',
                        '&:hover': { backgroundColor: '#357ABD' },
                        width: '100%'
                    }}
                >
                    Continua con Google
                </Button>

                <Divider sx={{ width: '100%' }}>Oppure</Divider>

                {tabValue === 0 ? (
                    <Box component="form" onSubmit={handleEmailLogin} sx={{ width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            startIcon={<EmailIcon />}
                            disabled={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Login
                        </Button>
                    </Box>
                ) : (
                    <Box component="form" onSubmit={handleRegister} sx={{ width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            helperText="La password deve essere di almeno 6 caratteri"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            startIcon={<EmailIcon />}
                            disabled={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Registrati
                        </Button>
                    </Box>
                )}

                <Typography variant="body2" color="textSecondary">
                    Continuando, accetti i nostri Termini di Servizio e la Privacy Policy
                </Typography>
            </Box>
        </Container>
    );
};

export default LoginPage;
