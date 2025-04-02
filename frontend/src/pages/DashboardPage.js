// Modifica gli import
import React, { useState, useEffect } from 'react';
import { Pie, Line } from 'react-chartjs-2'; // Rimuovi Bar
// Rimuovi: import { Link } from 'react-router-dom';
// Modifica i percorsi degli import
import NewsPage from './NewsPage';
import AssistantPage from './AssistantPage';
import PortfolioAnalytics from '../components/PortfolioAnalytics';
import './Dashboard.css'; // Modifica il percorso del CSS
import { 
    Card, 
    CardContent, 
    Grid, 
    Tabs, 
    Tab, 
    Box, 
    Paper, 
    Typography 
  } from '@mui/material'; // Importa tutti i componenti MUI
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

const Dashboard = () => {
    console.log('Dashboard');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeInvestmentTab, setActiveInvestmentTab] = useState('overview');
  const [data, setData] = useState({
    users: [],
    transactions: [],
    assets: [],
    investments: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);

  // Dati esempio per i grafici
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, transactions, assets, investments, categories] = await Promise.all([
          fetch("/api/users").then(res => res.json()),
          fetch("/api/transactions").then(res => res.json()),
          fetch("/api/assets").then(res => res.json()),
          fetch("/api/investments").then(res => res.json()),
          fetch("/api/categories").then(res => res.json())
        ]);
        
        setData({ users, transactions, assets, investments, categories });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderInvestmentContent = () => {
    switch (activeInvestmentTab) {
      case 'overview':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Allocazione Portafoglio</Typography>
                  <Pie data={portfolioAllocationData} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Performance</Typography>
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
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Transazioni Investimenti</Typography>
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
                    {data.investments.map(investment => (
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
        return <PortfolioAnalytics data={data.investments} />;
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
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

      <Paper sx={{ p: 3, mt: 2 }}>
        {activeTab === 'dashboard' && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h4" gutterBottom>Panoramica Finanziaria</Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Patrimonio Totale</Typography>
                  <Typography variant="h4">$25,430.00</Typography>
                  <Line data={performanceData} />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Ultime Transazioni</Typography>
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
                        {data.transactions.slice(0, 5).map(transaction => (
                          <tr key={transaction.id}>
                            <td>{new Date(transaction.date).toLocaleDateString()}</td>
                            <td>{transaction.description}</td>
                            <td>{transaction.category}</td>
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

        {activeTab === 'news' && <NewsPage />}
        {activeTab === 'assistant' && <AssistantPage />}
      </Paper>
    </div>
  );
};

export default Dashboard;
