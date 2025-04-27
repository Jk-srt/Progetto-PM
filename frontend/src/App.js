import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthProvider';
import{ErrorBoundary} from './components/ErrorBoundary';
import {LoadingScreen }from './components/LoadingScreen';
import {ErrorPage} from './pages/ErrorPage';
import DebugLocation from './components/DebugLocation'; // Assicurati che il percorso sia corretto
import AddTransactionPage from './pages/AddTransactionPage'; // Assicurati che il percorso sia corretto
import AddInvestmentPage from './pages/AddInvestmentPage';
import { use } from 'react';
import { Link } from 'react-router-dom';

// Lazy loading delle pagine
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const AssistantPage = lazy(() => import('./pages/AssistantPage'));
const LogoutPage = lazy(() => import('./pages/LogoutPage'));

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 600,
      letterSpacing: '0.5px',
    },
  },
  transitions: {
    duration: {
      shortest: 150,
      standard: 300,
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (user) {
    localStorage.setItem('GoogleUser', JSON.stringify(user));
    console.log('GoogleUser (saved):', user);
  }
  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RouteManager = () => (
  <>
    <Routes>
      {/* Aggiungi il reindirizzamento della root */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <nav style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem', backgroundColor: '#1e1e1e' }}>
              <button
                style={{
                  backgroundColor: '#f44336',
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onClick={() => (window.location.href = '/logout')}
              >
                Logout
              </button>
            </nav>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/add-transaction" element={<AddTransactionPage />} />
      <Route path="/add-investment" element={<AddInvestmentPage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/assistant" element={<AssistantPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  </>
);


export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <ErrorBoundary>
              <Suspense fallback={<LoadingScreen />}>
                <RouteManager />
                <DebugLocation />
              </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}
