import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NewsPage from './pages/NewsPage';
import AssistantPage from './pages/AssistantPage';
import PortfolioAnalytics from './components/PortfolioAnalytics';
import InvestmentsDetail from './components/InvestmentsDetail';
import TransactionsList from './components/TransactionsList';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

export default function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />}>
                <Route index element={<PortfolioAnalytics />} />
                <Route path="investments" element={<InvestmentsDetail />} />
                <Route path="transactions" element={<TransactionsList />} />
              </Route>
              <Route path="/news" element={<NewsPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
