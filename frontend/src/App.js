import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthProvider';
import{ErrorBoundary} from './components/ErrorBoundary';
import {LoadingScreen }from './components/LoadingScreen';
import {ErrorPage} from './pages/ErrorPage';
import DebugLocation from './components/DebugLocation'; // Assicurati che il percorso sia corretto
import { use } from 'react';


// Lazy loading delle pagine
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const AssistantPage = lazy(() => import('./pages/AssistantPage'));

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
    <Route path="/news" element={<NewsPage />} />
    <Route path="/assistant" element={<AssistantPage />} />
    <Route path="*" element={<ErrorPage />} />
  </Routes>
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
