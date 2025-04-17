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
  localStorage.setItem('GoogleUser', user);

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
    <nav style={{ padding: '1rem', backgroundColor: '#1e1e1e' }}>
        <Link to="/dashboard" style={{ marginRight: '1rem', color: '#90caf9' }}>Dashboard</Link>
        <Link to="/add-transaction" style={{ marginRight: '1rem', color: '#90caf9' }}>Add Transaction</Link>
        <Link to="/logout" style={{ color: '#f48fb1' }}>Logout</Link>
    </nav>
  <Routes>
    {/* Aggiungi il reindirizzamento della root */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
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
