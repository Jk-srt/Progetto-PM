import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import { AuthProvider, useAuth } from './context/AuthProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorPage } from './pages/ErrorPage';
import AddTransactionPage from './pages/AddTransactionPage';
import AddInvestmentPage from './pages/AddInvestmentPage';

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

// CSS globale per nascondere la scrollbar verticale mantenendo lo scroll
const globalScrollbarStyles = {
  // applica a tutto, inclusi drawer interni
  '*': {
    scrollbarWidth: 'none',      // Firefox
    '&::-webkit-scrollbar': {    // WebKit
      width: 0,
      background: 'transparent',
    },
  },
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  // Salva l'utente una volta autenticato
  localStorage.setItem('GoogleUser', JSON.stringify(user));
  return children;
};

const RouteManager = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/add-transaction" element={<AddTransactionPage />} />
    <Route path="/add-investment" element={<AddInvestmentPage />} />
    <Route path="/news" element={<NewsPage />} />
    <Route path="/assistant" element={<AssistantPage />} />
    <Route path="/logout" element={<LogoutPage />} />
    <Route path="*" element={<ErrorPage />} />
  </Routes>
);

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      {/* Reset CSS e scrollbar nascoste globali */}
      <CssBaseline />
      <GlobalStyles styles={globalScrollbarStyles} />

      <Router>
        <AuthProvider>
          <ErrorBoundary>
            <Suspense fallback={<LoadingScreen />}>
              <RouteManager />
            </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}
