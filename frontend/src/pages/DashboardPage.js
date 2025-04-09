import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Box,
  Paper,
  Typography
} from '@mui/material';
import { Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Transactions from './TransactionsPage';
import NewsPage from './NewsPage';
import AssistantPage from './AssistantPage';
import PortfolioAnalytics from '../components/PortfolioAnalytics';
import './DashboardCSS.css';
import TransactionsList from './TransactionsPage';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeInvestmentTab, setActiveInvestmentTab] = useState('overview');
  const [data, setData] = useState({
    transactions: [],
    investments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Dati grafici
  const portfolioAllocationData = {
    labels: ['Azioni', 'Obbligazioni', 'ETF', 'Cripto'],
    datasets: [{
      data: [45, 25, 20, 10],
      backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e']
    }]
  };

  const performanceData = {
    labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'],
    datasets: [{
      label: 'Rendimento',
      data: [65, 59, 80, 81, 56, 55],
      borderColor: '#4e73df',
      tension: 0.4
    }]
  };

  // Fetch dati iniziali
  useEffect(() => {
  const fetchData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found in localStorage');
      }
      console.log("User ID:", userId); // Debug: verifica l'ID utente

      const [transactions, investments] = await Promise.all([
        fetch('http://localhost:5000/api/transactions', {
          headers: {
            'userId': userId
          }
        }).then(res => res.json()),
        fetch('http://localhost:5000/api/investments', {
          headers: {
            'userId': userId
          }
        }).then(res => res.json())
      ]);
      console.log("Transactions:", transactions); // Debug: verifica le transazioni
      console.log("Investments:", investments); // Debug: verifica gli investimenti

      setData({ transactions, investments });
      setLoading(false);
    } catch (error) {
      console.error("Errore nel caricamento dati:", error);
      setError(true);
      setLoading(false);
    }
  };

  fetchData();
}, []);


  // Render contenuto investimenti
  const renderInvestmentContent = () => {
    switch (activeInvestmentTab) {
      case 'overview':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Allocazione Portafoglio
                  </Typography>
                  <Pie data={portfolioAllocationData} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Performance Storiche
                  </Typography>
                  <Line data={performanceData} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 'analytics':
        return <PortfolioAnalytics data={data.investments} />;

      case 'transactions':
        return (
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Storico Transazioni
              </Typography>
              <div className="table-responsive">
                <table className="investment-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Asset</th>
                      <th>Tipo</th>
                      <th>Quantità</th>
                      <th>Prezzo</th>
                      <th>Totale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.investments.map((investment) => (
                      <tr key={investment.id}>
                        <td>{new Date(investment.date).toLocaleDateString()}</td>
                        <td>{investment.asset}</td>
                        <td>{investment.type}</td>
                        <td>{investment.quantity}</td>
                        <td>${investment.price.toFixed(2)}</td>
                        <td>${(investment.quantity * investment.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  // Gestione stati di caricamento/errore
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography variant="h6">Caricamento dati in corso...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography variant="h6" color="error">
          Errore nel caricamento dei dati. Riprovare più tardi.
        </Typography>
      </Box>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Menu principale */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Dashboard" value="dashboard" />
          <Tab label="Transazioni" value="transactions" />
          <Tab label="Investimenti" value="investments" />
          <Tab label="Notizie" value="news" />
          <Tab label="Assistente" value="assistant" />
        </Tabs>
      </Box>

      {/* Contenuto principale */}
      <Paper sx={{ p: 3, mt: 2 }}>
        {activeTab === 'dashboard' && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h4" gutterBottom>
                Panoramica Finanziaria
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Patrimonio Totale
                  </Typography>
                  <Typography variant="h4" color="primary" gutterBottom>
                    $25,430.00
                  </Typography>
                  <Line data={performanceData} />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Ultime Transazioni
                  </Typography>
                  <div className="table-responsive">
                    <table className="transactions-table">
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Descrizione</th>
                          <th>Categoria</th>
                          <th>Importo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.transactions.map((transaction, index) => (
                          <tr key={index}>
                            <td>{new Date(transaction.date).toLocaleDateString()}</td>
                            <td>{transaction.description}</td>
                            <td>{transaction.category?.name || 'N/A'}</td>
                            <td>${transaction.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 'investments' && (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs
                value={activeInvestmentTab}
                onChange={(e, newValue) => setActiveInvestmentTab(newValue)}
              >
                <Tab label="Panoramica" value="overview" />
                <Tab label="Analisi" value="analytics" />
                <Tab label="Transazioni" value="transactions" />
              </Tabs>
            </Box>
            {renderInvestmentContent()}
          </>
        )}
        {activeTab === 'transactions' && <Transactions transactions={data.transactions} />}
        {activeTab === 'news' && <NewsPage />}
        {activeTab === 'assistant' && <AssistantPage />}
      </Paper>
    </div>
  );
};

export default DashboardPage;
