import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Button,
  Divider,
} from '@mui/material';
import {
  Wallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  Savings as SavingsIcon,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import { Line, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import InvestmentService from '../services/InvestmentService';

const InvestmentsPage = () => {
  const [investments, setInvestments] = useState([]);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolioChange, setPortfolioChange] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const data = await InvestmentService.getAll();
        setInvestments(data.data);
        const totalValue = data.data.reduce((sum, inv) => sum + inv.value, 0);
        setPortfolioValue(totalValue);
        setPortfolioChange((totalValue - 24000) / 24000 * 100); // Example baseline
      } catch (error) {
        console.error('Error fetching investments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, []);

  const portfolioPerformanceData = {
    labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
    datasets: [
      {
        label: 'Valore Portafoglio',
        data: [18500, 19200, 20100, 20800, 21500, 22300, 21800, 22500, 23200, 23800, 24200, portfolioValue],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const assetAllocationData = {
    labels: ['Azioni', 'Obbligazioni', 'ETF', 'Crypto'],
    datasets: [
      {
        data: [62, 23, 10, 5], // Example data
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <LinearProgress />
        </Box>
      ) : (
        <>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold">
              Dashboard Investimenti
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Benvenuto! Ecco l'andamento dei tuoi investimenti.
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Valore Portafoglio
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        €{portfolioValue.toLocaleString()}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={portfolioChange >= 0 ? 'success.main' : 'error.main'}
                      >
                        {portfolioChange >= 0 ? '+' : ''}
                        {portfolioChange.toFixed(2)}% (oggi)
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <WalletIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            {/* Add more cards as needed */}
          </Grid>

          {/* Charts */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Andamento Portafoglio
                  </Typography>
                  <Line data={portfolioPerformanceData} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Allocazione Asset
                  </Typography>
                  <Doughnut data={assetAllocationData} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Investments List */}
          <Box sx={{ mt: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  I tuoi investimenti
                </Typography>
                {investments.map((investment, index) => (
                  <Box
                    key={index}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}
                  >
                    <Box>
                      <Typography variant="body1">{investment.assetName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {investment.quantity} unità
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="body1">€{investment.value.toLocaleString()}</Typography>
                      <Typography
                        variant="body2"
                        color={investment.change >= 0 ? 'success.main' : 'error.main'}
                      >
                        {investment.change >= 0 ? '+' : ''}
                        {investment.change.toFixed(2)}%
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>
        </>
      )}
    </Box>
  );
};

export default InvestmentsPage;
