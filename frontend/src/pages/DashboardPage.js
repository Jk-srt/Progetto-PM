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

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend,
    TimeScale
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
  const [openAddInv, setOpenAddInv] = useState(false);

  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [isEditInvestmentDialogOpen, setIsEditInvestmentDialogOpen] = useState(false);
  const [isDeleteInvestmentDialogOpen, setIsDeleteInvestmentDialogOpen] = useState(false);

  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);

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

    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const now = new Date();
    let startDate = new Date(now);
    switch(range) {
      case '1w': startDate.setDate(now.getDate() - 7); break;
      case '1m': startDate.setMonth(now.getMonth() - 1); break;
      case '6m': startDate.setMonth(now.getMonth() - 6); break;
      case '1y': startDate.setFullYear(now.getFullYear() - 1); break;
      default: startDate.setMonth(now.getMonth() - 1);
    }

    const filteredTx = sortedTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= startDate && txDate <= now;
    });

    let txToUse = filteredTx;
    if (txToUse.length === 0 && sortedTransactions.length > 0) {
      txToUse = [sortedTransactions[0], sortedTransactions[sortedTransactions.length - 1]];
    }

    let runningBalance = 0;
    const balanceData = [];
    sortedTransactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (txDate < startDate) {
        runningBalance += tx.amount;
      }
    });

    txToUse.forEach(tx => {
      runningBalance += tx.amount;
      balanceData.push({
        date: new Date(tx.date),
        balance: runningBalance
      });
    });

    const maxPoints = 15;
    let sampledData = balanceData;
    if (balanceData.length > maxPoints) {
      const step = Math.ceil(balanceData.length / maxPoints);
      sampledData = balanceData.filter((_, idx) => idx % step === 0);
      if (sampledData[sampledData.length - 1] !== balanceData[balanceData.length - 1]) {
        sampledData.push(balanceData[balanceData.length - 1]);
      }
    }

    const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    const labels = sampledData.map(item => {
      const date = item.date;
      if (granularity === 'day') return `${date.getDate()} ${monthNames[date.getMonth()]}`;
      if (granularity === 'week') return `Sett ${Math.ceil(date.getDate()/7)}`;
      return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    });

    return {
      labels,
      datasets: [{
        label: 'Patrimonio',
        data: sampledData.map(d => d.balance),
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: theme.palette.primary.main
      }]
    };
  };

  const portfolioAllocationData = React.useMemo(() => {
    if (!data.investments || data.investments.length === 0) {
      return {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderColor: theme.palette.background.paper,
          borderWidth: 2
        }]
      };
    }

    // Group investments by asset name and calculate total CURRENT value for each
    const assetMap = {};
    data.investments.forEach(inv => {
      const assetName = inv.assetName || inv.AssetName;
      const quantity = parseFloat(inv.quantity || inv.Quantity);
      const currentPrice = parseFloat(inv.currentPrice || inv.CurrentPrice);
      const totalCurrentValue = quantity * currentPrice; // Using current price instead of purchase price

      if (!assetMap[assetName]) {
        assetMap[assetName] = {
          name: assetName,
          totalValue: 0
        };
      }
      assetMap[assetName].totalValue += totalCurrentValue;
    });

    const sorted = Object.values(assetMap).sort((a, b) => b.totalValue - a.totalValue);

    const palette = [
      theme.palette.primary.main,
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      '#9c27b0', // purple
      '#795548', // brown
      '#607d8b', // blue-gray
      '#00bcd4', // cyan
      '#4caf50'  // green
    ];

    return {
      labels: sorted.map(c => c.name),
      datasets: [{
        data: sorted.map(c => c.totalValue),
        backgroundColor: sorted.map((_, i) => palette[i % palette.length]),
        borderColor: theme.palette.background.paper,
        borderWidth: 2
      }]
    };
  }, [data.investments, theme]);

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
        setUserName(name);
      } catch (error) {
        console.error("Errore parsing GoogleUser", error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    setPerformanceData(generatePerformanceData(data.transactions, timeRange, timeGranularity));
  }, [data.transactions, timeRange, timeGranularity]);

  const generateProfitPerformanceData = (investments, range = '1m', granularity = 'day') => {
    if (!investments || investments.length === 0) return { labels: [], datasets: [] };

    // Calculate profit metrics for each investment
    const processedInvestments = investments.map(inv => {
      const quantity = parseFloat(inv.quantity || inv.Quantity);
      const purchasePrice = parseFloat(inv.purchasePrice || inv.PurchasePrice);
      const currentPrice = parseFloat(inv.currentPrice || inv.CurrentPrice);
      
      // Calculate investment metrics
      const initialValue = quantity * purchasePrice;
      const currentValue = quantity * currentPrice;
      const profit = currentValue - initialValue;
      const profitPercentage = initialValue > 0 ? (profit / initialValue) * 100 : 0;
      
      return {
        ...inv,
        purchaseDate: inv.purchaseDate || inv.PurchaseDate,
        initialValue,
        currentValue,
        profit,
        profitPercentage
      };
    });

    // Sort by purchase date
    const sortedInvestments = [...processedInvestments].sort(
      (a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate)
    );

    // Generate labels from purchase dates
    const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    const labels = sortedInvestments.map(inv => {
      const date = new Date(inv.purchaseDate);
      return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    });

    // Profit data
    const profitData = sortedInvestments.map(inv => inv.profit);
    
    // Profit percentage data
    const profitPercentageData = sortedInvestments.map(inv => inv.profitPercentage);
    
    // Asset names for tooltips
    const assetNames = sortedInvestments.map(inv => inv.assetName || inv.AssetName);

    return {
      labels,
      assetNames, // Store asset names for tooltip usage
      datasets: [
        {
          label: 'Profitto (€)',
          data: profitData,
          borderColor: theme.palette.success.main,
          backgroundColor: `${theme.palette.success.main}33`,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: theme.palette.success.main,
          pointBorderColor: theme.palette.background.paper,
          pointBorderWidth: 2,
          yAxisID: 'y'
        },
        {
          label: 'Percentuale (%)',
          data: profitPercentageData,
          borderColor: theme.palette.info.main,
          backgroundColor: `${theme.palette.info.main}33`,
          borderDash: [5, 5],
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointBackgroundColor: theme.palette.info.main,
          pointBorderColor: theme.palette.background.paper,
          pointBorderWidth: 2,
          yAxisID: 'y1'
        }
      ]
    };
  };

  const handleEditInvestment = (investment) => {
    setSelectedInvestment(investment);
    setIsEditInvestmentDialogOpen(true);
  };

  const handleDeleteInvestment = (investment) => {
    setSelectedInvestment(investment);
    setIsDeleteInvestmentDialogOpen(true);
  };

  const handleSaveInvestment = async (updatedInvestment) => {
    try {
      // Note: updatedInvestment should already be in PascalCase from the EditInvestmentDialog
      const response = await fetch(`https://backproject.azurewebsites.net/api/investments/${updatedInvestment.InvestmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          userId: localStorage.getItem('userId')
        },
        body: JSON.stringify(updatedInvestment)
      });

      if (!response.ok) {
        throw new Error('Failed to update investment.');
      }

      const updated = await response.json();
      
      // Convert PascalCase from API to camelCase for frontend
      const camelCaseInvestment = {
        investmentId: updated.InvestmentId || updated.investmentId,
        assetName: updated.AssetName || updated.assetName,
        quantity: updated.Quantity || updated.quantity,
        purchasePrice: updated.PurchasePrice || updated.purchasePrice,
        currentPrice: updated.CurrentPrice || updated.currentPrice,
        purchaseDate: updated.PurchaseDate || updated.purchaseDate,
        action: updated.Action || updated.action,
        userId: updated.UserId || updated.userId
      };
      
      setData((prevData) => ({
        ...prevData,
        investments: prevData.investments.map((inv) =>
          inv.investmentId === camelCaseInvestment.investmentId ? camelCaseInvestment : inv
        )
      }));
      setIsEditInvestmentDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirmDeleteInvestment = async () => {
    try {
      // Get the investment ID using proper casing (could be InvestmentId or investmentId)
      const investmentId = selectedInvestment.InvestmentId || selectedInvestment.investmentId;
      
      const response = await fetch(`https://backproject.azurewebsites.net/api/investments/${investmentId}`, {
        method: 'DELETE',
        headers: {
          userId: localStorage.getItem('userId')
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error deleting investment:", errorText);
        throw new Error(`Failed to delete investment: ${errorText || response.statusText}`);
      }

      setData((prevData) => ({
        ...prevData,
        investments: prevData.investments.filter(
          (inv) => {
            const currentId = inv.InvestmentId || inv.investmentId;
            return currentId !== investmentId;
          }
        )
      }));
      
      setIsDeleteInvestmentDialogOpen(false);
    } catch (error) {
      console.error(error);
      alert(`Error deleting investment: ${error.message}`);
    }
  };

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
      icon: <SavingsIcon />,
      color: theme.palette.success.main
    },
    {
      title: "Investimenti Attivi",
      value: data.investments.length,
      icon: <TrendingUpIcon />,
      color: theme.palette.info.main
    },
    {
      title: "Categorie",
      value: data.categories.length,
      icon: <ShoppingCartIcon />,
      color: theme.palette.warning.main
    }
  ];

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
    sx={{ display: 'flex', gap: 3, pt: 3, height: '100vh' }}
  >
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

    <Box 
      sx={{ flexGrow: 1, height: '100vh', pb: 5, overflowY: 'auto' }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}
      >
        {activeTab !== 'assistente' && (
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

      {!loading && !error && (
          <>
            {activeTab === 'dashboard' && (
                <>
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

                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} lg={8}>
                      <Card>
                        <CardHeader
                            title="Andamento Patrimonio"
                            sx={{ backgroundColor: theme.palette.primary.dark, color: theme.palette.primary.contrastText }}
                            titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                            action={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
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

                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardHeader 
                          title="Allocazione Portfolio" 
                          titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                          sx={{ 
                            backgroundColor: theme.palette.info.dark, 
                            color: theme.palette.info.contrastText 
                          }}
                        />
                        <CardContent>
                          <Pie
                            ref={(ref) => {
                              if (ref && ref.chartInstance) {
                                pieChartRef.current = ref.chartInstance;
                              }
                            }}
                            data={portfolioAllocationData}
                            options={{
                              plugins: {
                                legend: {
                                  display: true,
                                  position: 'bottom',
                                  labels: { boxWidth: 12 }
                                },
                                tooltip: {
                                  callbacks: {
                                    label: function(context) {
                                      const label = context.label || '';
                                      const value = context.raw;
                                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                      const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                      return `${label}: €${value.toFixed(2)} (${percentage}%)`;
                                    }
                                  }
                                }
                              }
                            }}
                            height={300}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  
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

