import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  Button,
  IconButton,
  Box,
  Tabs,
  Tab,
  useTheme,
  CircularProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import {
  Wallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  Savings as SavingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import Transactions from './TransactionsPage';
import NewsPage from './NewsPage';
import AssistantPage from './AssistantPage';
import PortfolioAnalytics from '../components/PortfolioAnalytics';
import AddTransactionPage from './AddTransactionPage';
import AddInvestmentPage from './AddInvestmentPage';
import AnaliticsPage from './AnaliticsPage';
import EditInvestmentDialog from '../components/EditInvestmentDialog'; // Import dialog
import DeleteConfirmDialog from '../components/DeleteConfirmDialog'; // Import delete dialog

// Aggiorna la registrazione dei componenti
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend,
    TimeScale  // Registra TimeScale
);

const DashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({
    transactions: [],
    investments: [],
    categories: []
  });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [timeRange, setTimeRange] = useState('1m');
  const [timeGranularity, setTimeGranularity] = useState('day');
  const [performanceData, setPerformanceData] = useState({
    labels: [],
    datasets: [{
      label: 'Rendimento',
      data: [],
      borderColor: theme.palette.primary.main,
      tension: 0.4
    }]
  });
  const [userImage, setUserImage] = useState(null);
  const [userName, setUserName] = useState(null);
  const [openAddTx, setOpenAddTx] = useState(false);
  const [openAddInv, setOpenAddInv] = useState(false); // stato per dialog nuovo investimento

  // Chart refs per cleanup
  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      if (lineChartRef.current) {
        lineChartRef.current.destroy();
        lineChartRef.current = null;
      }
      if (pieChartRef.current) {
        pieChartRef.current.destroy();
        pieChartRef.current = null;
      }
    };
  }, []);

  // Funzione migliorata per generare i dati delle performance
  // Funzione ottimizzata per generare dati di andamento con bilancio cumulativo
  const generatePerformanceData = (transactions, range = '1m', granularity = 'day') => {
    if (!transactions || transactions.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Patrimonio',
          data: [],
          borderColor: theme.palette.primary.main,
          tension: 0.4
        }]
      };
    }

    // Ordina le transazioni per data
    const sortedTransactions = [...transactions].sort((a, b) =>
        new Date(a.date) - new Date(b.date)
    );

    // Determina l'intervallo di date per il grafico
    const now = new Date();
    let startDate = new Date();

    switch(range) {
      case '1w': // 1 settimana
        startDate.setDate(now.getDate() - 7);
        break;
      case '1m': // 1 mese
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '6m': // 6 mesi
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y': // 1 anno
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1); // Predefinito: 1 mese
    }

    // Calcola il saldo iniziale (somma di tutte le transazioni prima della data di inizio)
    const initialBalance = sortedTransactions
        .filter(tx => new Date(tx.date) < startDate)
        .reduce((sum, tx) => sum + tx.amount, 0);

    // Genera punti data basati sulla granularità
    const datePoints = [];
    const dateIterator = new Date(startDate);

    while (dateIterator <= now) {
      datePoints.push(new Date(dateIterator));

      if (granularity === 'day') {
        dateIterator.setDate(dateIterator.getDate() + 1);
      } else if (granularity === 'week') {
        dateIterator.setDate(dateIterator.getDate() + 7);
      } else { // month
        dateIterator.setMonth(dateIterator.getMonth() + 1);
      }
    }

    // Calcola il saldo per ogni punto data
    let balance = initialBalance;
    const balanceData = [];

    for (let i = 0; i < datePoints.length; i++) {
      const currentDate = datePoints[i];
      const nextDate = i < datePoints.length - 1 ? datePoints[i + 1] : new Date(now.getTime() + 86400000);

      // Trova le transazioni avvenute tra la data corrente e quella successiva
      const periodTransactions = sortedTransactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= currentDate && txDate < nextDate;
      });

      // Aggiungi le transazioni al saldo
      const periodSum = periodTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      balance += periodSum;

      balanceData.push({
        date: currentDate,
        balance
      });
    }

    // Formatta le etichette in base alla granularità
    const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

    const labels = balanceData.map(item => {
      const date = item.date;

      if (granularity === 'day') {
        return `${date.getDate()} ${monthNames[date.getMonth()]}`;
      } else if (granularity === 'week') {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        return `Sett ${weekNum}`;
      } else { // month
        return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      }
    });

    // Estrai i valori di saldo per il grafico
    const data = balanceData.map(item => item.balance);

    return {
      labels,
      datasets: [{
        label: 'Patrimonio',
        data,
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: theme.palette.primary.main
      }]
    };
  };

  // Allocazione portafoglio dinamica in base a transazioni e categorie
  const portfolioAllocationData = {
    labels: data.categories.map(cat => cat.name),
    datasets: [{
      data: data.categories.map(cat =>
        data.transactions
          .filter(tx => tx.category?.id === cat.id)
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
      ),
      backgroundColor: data.categories.map((_, idx) => {
        const palette = [
          theme.palette.primary.main,
          theme.palette.success.main,
          theme.palette.info.main,
          theme.palette.warning.main,
          theme.palette.error.main
        ];
        return palette[idx % palette.length];
      }),
      borderColor: theme.palette.background.paper,
      borderWidth: 2
    }]
  };

  // Chart.js options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += '€' + context.parsed.y.toFixed(2);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: timeGranularity === 'day' ? 'day' :
              timeGranularity === 'week' ? 'week' : 'month',
          displayFormats: {
            day: 'd MMM',
            week: 'Sett W',
            month: 'MMM yyyy'
          }
        },
        ticks: {
          color: theme.palette.text.secondary,
          maxRotation: 45,
          minRotation: 0
        },
        grid: { color: theme.palette.divider }
      },
      y: {
        ticks: { color: theme.palette.text.secondary },
        grid: { color: theme.palette.divider },
        beginAtZero: false
      }
    }
  };

  // funzione per ricaricare i dati
  const fetchData = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const [transactions, investments, categories] = await Promise.all([
        fetch('https://backproject.azurewebsites.net/api/transactions', { headers: { userId } }).then(res => res.json()),
        fetch('https://backproject.azurewebsites.net/api/investments', { headers: { userId } }).then(res => res.json()),
        fetch('https://backproject.azurewebsites.net/api/categories', { headers: { userId } }).then(res => res.json())
      ]);
      const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
      setData({ transactions, investments, categories });
      setPerformanceData(generatePerformanceData(transactions));
      localStorage.setItem('categories', JSON.stringify(categories));
      setTotal(totalAmount);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const googleUser = localStorage.getItem("GoogleUser");
    if (googleUser) {
      try {
        const user = JSON.parse(googleUser);
        if (user.photoURL) setUserImage(user.photoURL);
        const name = user.displayName || user.email.split('@')[0];
        setUserName(name);   // <--- aggiunto
      } catch (error) {
        console.error("Errore parsing GoogleUser", error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    
  }, []);
  

  // Cards statistiche
  const stats = [
    {
      title: "Patrimonio Totale",
      value: `€${total.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`,
      icon: <WalletIcon />,
      color: theme.palette.primary.main
    },
    {
      title: "Transazioni Totali",
      value: data.transactions.length,
      icon: <TrendingUpIcon />,
      color: theme.palette.success.main
    },
    {
      title: "Investimenti Attivi",
      value: data.investments.length,
      icon: <SavingsIcon />,
      color: theme.palette.info.main
    },
    {
      title: "Categorie",
      value: data.categories.length,
      icon: <ShoppingCartIcon />,
      color: theme.palette.warning.main
    }
  ];

  // Sidebar Tabs
  const sidebarTabs = [
    { label: "Dashboard", value: "dashboard" },
    { label: "Transazioni", value: "transactions" },
    { label: "Analisi Mercato", value: "analitics" },
    { label: "Investimenti", value: "investments" },
    { label: "Notizie", value: "news" },
  ];

  return (
  <Container 
    maxWidth="xl" 
    sx={{ display: 'flex', gap: 3, pt: 3, height: '100vh' }}  // altezza fissa viewport
  >
    {/* Sidebar */}
    <Card sx={{ width: 260, flexShrink: 0, bgcolor: 'background.paper', borderRadius: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {userImage ? (
            <Avatar src={userImage} sx={{ width: 40, height: 40, mr: 2 }} />
          ) : (
            <AccountCircleIcon sx={{ fontSize: 40, mr: 2 }} />
          )}
          <div>
            <Typography variant="h6">{userName}</Typography>
            <Typography variant="body2" color="text.secondary">Profilo</Typography>
          </div>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Tabs
            orientation="vertical"
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ width: '100%' }}
        >
          {sidebarTabs.map(tab => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
          <Tab key='assistente' label='Assistente' value='assistente' />
        </Tabs>
        <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={() => navigate('/logout')}
            >
              Logout
            </Button>
          </Box>
      </CardContent>
    </Card>

    {/* Main Content */}
    <Box 
      sx={{ flexGrow: 1, height: '100vh', pb: 5, overflowY: 'auto' }}  // scroll interno
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}
      >
        {activeTab !== 'assistente' && ( // Nascondi il titolo per la pagina "Assistente"
          <Typography variant="h4" fontWeight={700}>
            {sidebarTabs.find(t => t.value === activeTab)?.label || "Dashboard"}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          
          {activeTab === 'transactions' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddTx(true)}
            >
              Nuova Transazione
            </Button>
          )}
          {activeTab === 'investments' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddInv(true)}
            >
              Nuovo Investimento
            </Button>
          )}
        </Box>
      </Box>

      {/* Loading/Error State */}
      {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
          </Box>
      )}
      {error && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <Typography color="error">Errore nel caricamento dei dati. Riprovare più tardi.</Typography>
          </Box>
      )}

      {/* Contenuto dinamico */}
      {!loading && !error && (
          <>
            {activeTab === 'dashboard' && (
                <>
                  {/* Stats Cards */}
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    {stats.map((stat, index) => (
                        <Grid item xs={12} sm={6} lg={3} key={index}>
                          <Card sx={{ height: '100%', borderLeft: `6px solid ${stat.color}` }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <Typography variant="body2" color="text.secondary">{stat.title}</Typography>
                                  <Typography variant="h5" fontWeight={700}>{stat.value}</Typography>
                                </div>
                                <Box sx={{
                                  bgcolor: stat.color + '22',
                                  color: stat.color,
                                  borderRadius: '50%',
                                  width: 44,
                                  height: 44,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  {stat.icon}
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                    ))}
                  </Grid>

                  {/* Charts Row */}
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} lg={8}>
                      <Card>
                        <CardHeader
                            title="Andamento Patrimonio"
                            action={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                  Periodo:
                                </Typography>
                                <Button
                                    variant={timeRange === '1w' ? 'contained' : 'outlined'}
                                    size="small"
                                    onClick={() => setTimeRange('1w')}
                                    sx={{ mr: 0.5, minWidth: 'auto', px: 1 }}
                                >
                                  1S
                                </Button>
                                <Button
                                    variant={timeRange === '1m' ? 'contained' : 'outlined'}
                                    size="small"
                                    onClick={() => setTimeRange('1m')}
                                    sx={{ mr: 0.5, minWidth: 'auto', px: 1 }}
                                >
                                  1M
                                </Button>
                                <Button
                                    variant={timeRange === '6m' ? 'contained' : 'outlined'}
                                    size="small"
                                    onClick={() => setTimeRange('6m')}
                                    sx={{ mr: 0.5, minWidth: 'auto', px: 1 }}
                                >
                                  6M
                                </Button>
                                <Button
                                    variant={timeRange === '1y' ? 'contained' : 'outlined'}
                                    size="small"
                                    onClick={() => setTimeRange('1y')}
                                    sx={{ minWidth: 'auto', px: 1 }}
                                >
                                  1A
                                </Button>
                              </Box>
                            }
                        />
                        <CardContent sx={{ height: 300, position: 'relative' }}>
                          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
                            <Button
                                variant={timeGranularity === 'day' ? 'contained' : 'outlined'}
                                size="small"
                                onClick={() => setTimeGranularity('day')}
                                sx={{ mr: 1 }}
                            >
                              Giorni
                            </Button>
                            <Button
                                variant={timeGranularity === 'week' ? 'contained' : 'outlined'}
                                size="small"
                                onClick={() => setTimeGranularity('week')}
                                sx={{ mr: 1 }}
                            >
                              Settimane
                            </Button>
                            <Button
                                variant={timeGranularity === 'month' ? 'contained' : 'outlined'}
                                size="small"
                                onClick={() => setTimeGranularity('month')}
                            >
                              Mesi
                            </Button>
                          </Box>
                          <div style={{ position: 'absolute', width: '100%', height: 'calc(100% - 48px)', bottom: 0 }}>
                            <Line
                                ref={(ref) => {
                                  if (ref && ref.chartInstance) {
                                    lineChartRef.current = ref.chartInstance;
                                  }
                                }}
                                data={performanceData}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                      backgroundColor: theme.palette.background.paper,
                                      titleColor: theme.palette.text.primary,
                                      bodyColor: theme.palette.text.secondary,
                                      callbacks: {
                                        label: function(context) {
                                          let label = context.dataset.label || '';
                                          if (label) {
                                            label += ': ';
                                          }
                                          if (context.parsed.y !== null) {
                                            label += '€' + context.parsed.y.toFixed(2);
                                          }
                                          return label;
                                        }
                                      }
                                    }
                                  },
                                  scales: {
                                    x: {
                                      ticks: { color: theme.palette.text.secondary },
                                      grid: { color: theme.palette.divider }
                                    },
                                    y: {
                                      ticks: { color: theme.palette.text.secondary },
                                      grid: { color: theme.palette.divider },
                                      beginAtZero: false
                                    }
                                  }
                                }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} lg={4}>
                      <Card>
                        <CardHeader title="Allocazione Portafoglio" />
                        <CardContent sx={{ height: 300 }}>
                          <Pie
                              ref={(ref) => {
                                if (ref && ref.chartInstance) {
                                  pieChartRef.current = ref.chartInstance;
                                }
                              }}
                              data={portfolioAllocationData}
                              options={{ plugins: { legend: { display: true, position: 'bottom' } } }}
                              height={300}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Recent Transactions Table */}
                  <Card>
                    <CardHeader
                        title="Ultime Transazioni"
                        action={
                          <Button onClick={() => setActiveTab('transactions')}>Vedi tutte</Button>
                        }
                    />
                    <Box sx={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr>
                          <th style={{ padding: 8, textAlign: 'left' }}>Data</th>
                          <th style={{ padding: 8, textAlign: 'left' }}>Descrizione</th>
                          <th style={{ padding: 8, textAlign: 'left' }}>Categoria</th>
                          <th style={{ padding: 8, textAlign: 'right' }}>Importo</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.transactions.slice(0, 8).map((transaction, idx) => (
                            <tr key={idx}>
                              <td style={{ padding: 8 }}>{new Date(transaction.date).toLocaleDateString()}</td>
                              <td style={{ padding: 8 }}>{transaction.description}</td>
                              <td style={{ padding: 8 }}>{transaction.category?.name || 'N/A'}</td>
                              <td style={{
                                padding: 8,
                                textAlign: 'right',
                                color: transaction.amount < 0 ? theme.palette.error.main : theme.palette.success.main
                              }}>
                                {transaction.amount < 0 ? '-' : '+'}€{Math.abs(transaction.amount).toFixed(2)}
                              </td>
                            </tr>
                        ))}
                        </tbody>
                      </table>
                    </Box>
                  </Card>
                </>
            )}

            {activeTab === 'transactions' && (
                <Transactions transactions={data.transactions} />
            )}
            {activeTab === 'analitics' && (
                <AnaliticsPage />
            )}
            {activeTab === 'investments' && (
                <PortfolioAnalytics data={data.investments} />
            )}
            {activeTab === 'news' && (
                <NewsPage />
            )}
            {activeTab === 'assistente' && (
                <AssistantPage />
            )}
          </>
      )}
    </Box>

    {/* Dialog per nuova transazione */}
    <Dialog
      open={openAddTx}
      onClose={() => setOpenAddTx(false)}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Nuova Transazione</DialogTitle>
      <DialogContent>
        <AddTransactionPage 
          onAdded={() => {
            setOpenAddTx(false);
            fetchData(); // ricarica dati dopo inserimento
          }}
        />
      </DialogContent>
    </Dialog>

    {/* Dialog per nuovo investimento */}
    <Dialog
      open={openAddInv}
      onClose={() => setOpenAddInv(false)}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Nuovo Investimento</DialogTitle>
      <DialogContent>
        <AddInvestmentPage
          onAdded={() => {
            setOpenAddInv(false);
            fetchData(); // ricarica dati dopo inserimento
          }}
        />
      </DialogContent>
    </Dialog>
  </Container>
  );
};

export default DashboardPage;
