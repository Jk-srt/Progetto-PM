import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  Button,
  Box,
  Tabs,
  Tab,
  useTheme,
  CircularProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Wallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  Savings as SavingsIcon,
  AccountCircle as AccountCircleIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  Article as ArticleIcon,
  Chat as ChatIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip as ChartTooltip,
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
import {fetchRealTimePrice} from "../services/FinnhubService";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    ChartTooltip,
    Legend,
    TimeScale
);

export default function DashboardPage() {
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
  const [timeGranularity] = useState('day');
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
  const [refreshingPortfolio, setRefreshingPortfolio] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);

  const handleToggleSidebar = () => {
    setCollapsed(prev => !prev);
  };

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
  const generatePerformanceData = React.useCallback((transactions, range = '1m', granularity = 'day') => {
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
  
    // Formatta le etichette in base alla granularità
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
  }, [theme]);

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
      const currentPrice = parseFloat(inv.currentPrice || inv.CurrentPrice || inv.purchasePrice || inv.PurchasePrice);
      const totalCurrentValue = quantity * currentPrice;

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

  // New function to refresh portfolio allocation data
  // First, wrap refreshPortfolioAllocation in useCallback
  const refreshPortfolioAllocation = useCallback(async () => {
    setRefreshingPortfolio(true);
    try {
      const userId = localStorage.getItem('userId');
      const investmentsResponse = await fetch('https://backproject.azurewebsites.net/api/investments', {
        headers: { userId }
      });
  
      if (!investmentsResponse.ok) {
        throw new Error(`Failed to fetch investments: ${investmentsResponse.status}`);
      }
  
      const investments = await investmentsResponse.json();
  
      // Calculate current values for investments
      const updatedInvestments = await Promise.all(investments.map(async (inv) => {
        try {
          // Try to get real-time price if possible
          const quote = await fetchRealTimePrice(inv.assetName || inv.AssetName);
          const currentPrice = quote?.price || inv.currentPrice || inv.CurrentPrice || inv.purchasePrice || inv.PurchasePrice;
  
          return {
            ...inv,
            currentPrice: currentPrice,
            CurrentPrice: currentPrice // Include both case styles for compatibility
          };
        } catch (error) {
          console.warn(`Couldn't fetch real-time price for ${inv.assetName || inv.AssetName}:`, error);
          // Fallback to stored current price
          return inv;
        }
      }));
  
      setData(prevData => ({
        ...prevData,
        investments: updatedInvestments
      }));
  
      console.log("Portfolio allocation data refreshed successfully:", updatedInvestments);
    } catch (error) {
      console.error("Error refreshing portfolio allocation data:", error);
    } finally {
      setRefreshingPortfolio(false);
    }
  }, []); // Add any dependencies used inside the function
  
  // Then, make sure fetchData includes refreshPortfolioAllocation in its dependencies
  const fetchData = useCallback(async () => {
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
  
      // After loading initial data, also refresh portfolio allocation with current prices
      await refreshPortfolioAllocation();
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [refreshPortfolioAllocation, generatePerformanceData]); // Include all dependencies

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
  }, []);

useEffect(() => {
  setPerformanceData(generatePerformanceData(data.transactions, timeRange, timeGranularity));
}, [data.transactions, timeRange, timeGranularity, generatePerformanceData]);
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
    }
  ];

  // Sidebar Tabs con icone
  const sidebarTabs = [
    { label: "Dashboard",   value: "dashboard",   icon: <DashboardIcon /> },
    { label: "Transazioni",  value: "transactions",icon: <SavingsIcon /> },
    { label: "Investimenti", value: "investments", icon: <TrendingUpIcon /> },
    { label: "Analisi Mercato", value: "analitics",icon: <BarChartIcon /> },
    { label: "Notizie",      value: "news",        icon: <ArticleIcon /> },
    { label: "Assistente",   value: "assistente",  icon: <ChatIcon /> }
  ];

  return (
  <Container 
    maxWidth="xl" 
    sx={{ display: 'flex', gap: 3, pt: 3, height: '100vh' }}
  >
    {/* Sidebar */}
    <Card sx={{
      width: collapsed ? 64 : 260,
      flexShrink: 0,
      bgcolor: 'background.paper',
      borderRadius: 3,
      transition: 'width 0.3s',
      overflow: 'visible'
    }}>
      <CardContent sx={{
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Toggle Button */}
        <Box sx={{ mb: 2 }}>
          <IconButton size="small" onClick={handleToggleSidebar}>
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>

        {/* User Info */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 3,
          justifyContent: 'center'
        }}>
          {userImage
            ? <Avatar src={userImage} sx={{ width: 40, height: 40, mr: collapsed ? 0 : 2 }} />
            : <AccountCircleIcon sx={{ fontSize: 40, mr: collapsed ? 0 : 2 }} />}
          {!collapsed && (
            <Typography variant="h6">{userName}</Typography>
          )}
        </Box>

        <Divider sx={{ width: '100%', my: 2 }} />

        {/* Tabs collassabili */}
        <Tabs
          orientation="vertical"
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          TabIndicatorProps={{
            sx: {
              left: 'auto',
              right: 0,
              width: '4px',
              bgcolor: theme.palette.primary.main,
              borderRadius: '4px 0 0 4px'
            }
          }}
          sx={{
            width: '100%',
            overflowX: 'visible',
            '& .MuiTabs-flexContainer': {
              flexDirection: 'column',
              justifyContent: collapsed ? 'flex-start' : 'center',
              alignItems: 'center',
              overflow: 'visible'
            }
          }}
        >
          {sidebarTabs.map(tab => (
            <Tooltip key={tab.value} title={collapsed ? tab.label : ''} placement="right">
              <Tab
                value={tab.value}
                icon={tab.icon}
                iconPosition={collapsed ? 'center' : 'start'}
                label={!collapsed ? tab.label : ''}
                sx={{
                  width: '100%',
                  justifyContent: 'center',
                  px: collapsed ? 0 : 2,
                  py: 1,
                  minHeight: 48,
                  color: theme.palette.text.secondary,                // colore di default
                  '& .MuiTab-iconWrapper': {
                    color: 'inherit'                                  // icona eredita il colore del Tab
                  },
                  '&.Mui-selected': {
                    borderRight: collapsed ? 'none' : `4px solid ${theme.palette.primary.main}`,
                    color: theme.palette.primary.main,               // testo azzurro
                    '& .MuiTab-iconWrapper': {
                      color: theme.palette.primary.main              // icona azzurra quando selezionato
                    }
                  }
                }}
              />
            </Tooltip>
          ))}
          <Tooltip title={collapsed ? 'Logout' : ''} placement="right">
            <Tab
              value="logout"
              icon={<LogoutIcon />}
              label={!collapsed ? 'Logout' : ''}
              iconPosition={collapsed ? 'center' : 'start'}
              sx={{
                width: '100%',
                justifyContent: 'center',
                px: collapsed ? 0 : 2,
                py: 1,
                minHeight: 48,
                color: theme.palette.error.main,                    // colore di default logout
                '& .MuiTab-iconWrapper': {
                  color: 'inherit'                                  // icona eredita il colore del Tab
                },
                '&.Mui-selected': {
                  borderRight: collapsed ? 'none' : `4px solid ${theme.palette.primary.main}`,
                  color: theme.palette.primary.main,               // testo azzurro
                  '& .MuiTab-iconWrapper': {
                    color: theme.palette.primary.main              // icona azzurra quando selezionato
                  }
                }
              }}
              onClick={() => navigate('/logout')}
            />
          </Tooltip>
        </Tabs>
      </CardContent>
    </Card>

    {/* Main Content */}
    <Box 
      sx={{ flexGrow: 1, height: '100vh', pb: 5, overflowY: 'auto' }}
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
        {activeTab !== 'assistente' && (
          <Typography variant="h4" fontWeight={700}>
            {sidebarTabs.find(t => t.value === activeTab)?.label || "Dashboard"}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Tooltip title="Ricarica dati">
            <IconButton 
              onClick={fetchData} 
              color="primary" 
              sx={{ 
                backgroundColor: theme.palette.primary.light + '20',
                '&:hover': { backgroundColor: theme.palette.primary.light + '40' }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
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
                        <Card 
                          sx={{ 
                            height: '100%', 
                            borderLeft: `6px solid ${stat.color}`,
                            cursor: stat.title === "Transazioni Totali" || stat.title === "Investimenti Attivi" ? 'pointer' : 'default'
                          }}
                          onClick={() => {
                            if (stat.title === "Transazioni Totali") setActiveTab('transactions');
                            if (stat.title === "Investimenti Attivi") setActiveTab('investments');
                          }}
                        >
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

                    <Grid item xs={12} lg={4}>
                      <Card>
                        <CardHeader 
                          title="Allocazione Portfolio" 
                          titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                          sx={{ 
                            backgroundColor: theme.palette.info.dark, 
                            color: theme.palette.info.contrastText 
                          }}
                          action={
                            <Tooltip title="Ricarica dati allocazione">
                              <IconButton 
                                onClick={refreshPortfolioAllocation} 
                                disabled={refreshingPortfolio}
                                size="small"
                                sx={{ color: theme.palette.info.contrastText }}
                              >
                                {refreshingPortfolio ? 
                                  <CircularProgress size={20} color="inherit" /> : 
                                  <RefreshIcon />
                                }
                              </IconButton>
                            </Tooltip>
                          }
                        />
                        <CardContent sx={{ height: 300, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {data.investments && data.investments.length > 0 ? (
                            <Pie
                              ref={(ref) => {
                                if (ref && ref.chartInstance) {
                                  pieChartRef.current = ref.chartInstance;
                                }
                              }}
                              data={portfolioAllocationData}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    display: true,
                                    position: 'right',
                                    labels: { 
                                      boxWidth: 12,
                                      font: {
                                        size: 11
                                      }
                                    }
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
                            />
                          ) : refreshingPortfolio ? (
                            <Box sx={{ textAlign: 'center' }}>
                              <CircularProgress size={40} />
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                Caricamento dati...
                              </Typography>
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Nessun dato di investimento disponibile
                              </Typography>
                              <Button 
                                variant="outlined" 
                                size="small"
                                startIcon={<RefreshIcon />}
                                onClick={refreshPortfolioAllocation}
                              >
                                Ricarica dati
                              </Button>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Grid container spacing={4} sx={{ mt: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Card sx={{ p: 2 }}>
                        <CardHeader
                            title={<Typography variant="h5" sx={{ fontWeight: 700 }}>Ultime Transazioni</Typography>}
                            action={
                              <Button size="large" sx={{ fontSize: '1.1rem', px: 2 }} color="primary" onClick={() => setActiveTab('transactions')}>
                                Vedi tutte
                              </Button>
                            }
                            sx={{ pb: 1 }}
                        />
                        <Divider />
                        <CardContent sx={{ p: 2 }}>
                          <Table size="medium">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Data</TableCell>
                                <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Descrizione</TableCell>
                                <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Categoria</TableCell>
                                <TableCell align="right" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Importo</TableCell>
                              </TableRow>
                            </TableHead>
                            {/* Ultime Transazioni */}
                            <TableBody>
                              {data.transactions
                                .sort((a, b) => new Date(b.date) - new Date(a.date))  // Sort by date (newest first)
                                .slice(0, 4)
                                .map((transaction, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell sx={{ fontSize: '1.08rem', py: 2 }}>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                    <TableCell sx={{ fontSize: '1.08rem', py: 2 }}>{transaction.description}</TableCell>
                                    <TableCell sx={{ fontSize: '1.08rem', py: 2 }}>{transaction.category?.name || 'N/A'}</TableCell>
                                    <TableCell align="right" sx={{ fontSize: '1.08rem', py: 2, fontWeight: 600, color: transaction.amount >= 0 ? 'success.main' : 'error.main' }}>
                                      {transaction.amount < 0 ? '-' : '+'}€{Math.abs(transaction.amount).toFixed(2)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card sx={{ p: 2 }}>
                        <CardHeader
                            title={<Typography variant="h5" sx={{ fontWeight: 700 }}>Ultimi Investimenti</Typography>}
                            action={
                              <Button size="large" sx={{ fontSize: '1.1rem', px: 2 }} color="primary" onClick={() => setActiveTab('investments')}>
                                Vedi tutti
                              </Button>
                            }
                            sx={{ pb: 1 }}
                        />
                        <Divider />
                        <CardContent sx={{ p: 2 }}>
                          <Table size="medium">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Data</TableCell>
                                <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Asset</TableCell>
                                <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Quantità</TableCell>
                                <TableCell align="right" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Valore</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {data.investments
                                  .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
                                  .slice(0, 4)
                                  .map((investment, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell sx={{ fontSize: '1.08rem', py: 2 }}>{new Date(investment.purchaseDate).toLocaleDateString()}</TableCell>
                                        <TableCell sx={{ fontSize: '1.08rem', py: 2 }}>{investment.assetName}</TableCell>
                                        <TableCell sx={{ fontSize: '1.08rem', py: 2 }}>{investment.quantity}</TableCell>
                                        <TableCell align="right" sx={{ fontSize: '1.08rem', py: 2, fontWeight: 600 }}>
                                          €{(investment.currentPrice * investment.quantity).toFixed(2)}
                                        </TableCell>
                                      </TableRow>
                                  ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
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
}

