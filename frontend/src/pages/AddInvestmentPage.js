import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import { fetchListingStatus, fetchQuoteOnNearestTradingDate } from '../services/YahooFinanceService';
import InvestmentService from '../services/InvestmentService';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField,
  Button, InputAdornment, Divider,
  Grid, CircularProgress, Alert, Paper, useTheme,
  IconButton, Tooltip, Snackbar
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShowChart as ShowChartIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  Money as MoneyIcon,
  Calculate as CalculateIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  InfoOutlined as InfoOutlinedIcon
} from '@mui/icons-material';

const AddInvestmentPage = ({onAdded}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [investment, setInvestment] = useState({
    Type: 0,
    Quantity: '',
    Price: '',
    Date: new Date().toISOString().split('T')[0],
    unitPrice: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [assetInfo, setAssetInfo] = useState(null);

  // Carica simboli da YahooFinanceService
  const loadOptions = async (inputValue) => {
    if (!inputValue) return [];
    
    setSnackbar({
      open: true,
      message: 'Ricerca asset in corso...',
      severity: 'info'
    });
    
    try {
      const list = await fetchListingStatus(inputValue);
      
      if (list.length === 0) {
        setSnackbar({
          open: true,
          message: 'Nessun risultato trovato. Prova con un altro termine.',
          severity: 'warning'
        });
      } else {
        setSnackbar({
          open: true,
          message: `${list.length} risultati trovati`,
          severity: 'success'
        });
      }
      
      return list.map(item => ({
        label: `${item.name} (${item.symbol})`,
        value: item.symbol,
        name: item.name,
        type: item.type,
        exchange: item.exchange
      }));
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Errore nella ricerca. Riprova più tardi.',
        severity: 'error'
      });
      return [];
    }
  };

  // Quando cambia asset o data, aggiorna unitPrice e ricalcola Price/Quantity
  useEffect(() => {
    if (!selectedAsset || !investment.Date) return;
    
    setAssetInfo({
      loading: true,
      data: null,
      error: null
    });
    
    fetchQuoteOnNearestTradingDate(selectedAsset.value, investment.Date)
      .then(data => {
        const up = data.price ?? 0;
        setInvestment(prev => {
          const qty = parseFloat(prev.Quantity) || 0;
          return {
            ...prev,
            unitPrice: up,
            Price: (qty ? (up * qty).toFixed(2) : up.toString())
          };
        });
        setAssetInfo({
          loading: false,
          data: {
            price: data.price,
            date: data.date,
            change: data.change,
            changePercent: data.changePercent
          },
          error: null
        });
      })
      .catch(err => {
        console.error(err);
        setAssetInfo({
          loading: false,
          data: null,
          error: 'Impossibile ottenere i dati di mercato attuali.'
        });
      });
  }, [selectedAsset, investment.Date]);

  // Gestori personalizzati per evitare loop di useEffect
  const handleQuantityChange = (e) => {
    const qty = parseFloat(e.target.value) || 0;
    setInvestment(prev => ({
      ...prev,
      Quantity: e.target.value,
      Price: (prev.unitPrice * qty).toFixed(2)
    }));
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    // costruisci il payload in camelCase
    const payload = {
      quantity: parseFloat(investment.Quantity),
      purchasePrice: parseFloat(investment.Price),
      currentPrice: investment.unitPrice || 0,
      // genera un ISO string corretto in UTC
      purchaseDate: new Date(investment.Date).toISOString(),
      action: 0,                         // 0 = Buy
      assetName: selectedAsset.value       // camelCase
    };
  
    try {
      // assicurati che create invii:
      // axios.post('/api/investments', payload, { headers: { userId: … }})
      await InvestmentService.create(payload);
      setSnackbar({
        open: true,
        message: 'Investimento aggiunto con successo!',
        severity: 'success'
      });
      setTimeout(() => {
        if (onAdded) {
          onAdded();
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      padding: '8px',
      borderRadius: '8px',
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: 'none',
      backgroundColor: theme.palette.background.paper,
      '&:hover': {
        borderColor: theme.palette.primary.main
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme.palette.background.paper,
      borderRadius: '8px',
      boxShadow: theme.shadows[3],
      zIndex: 10
    }),
    option: (provided, state) => ({
      ...provided,
      padding: '10px 16px',
      backgroundColor: state.isFocused ? theme.palette.action.hover : 'transparent',
      color: state.isSelected ? theme.palette.primary.main : theme.palette.text.primary,
      '&:hover': {
        backgroundColor: theme.palette.action.hover
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: theme.palette.text.primary
    }),
    input: (provided) => ({
      ...provided,
      color: theme.palette.text.primary
    }),
    placeholder: (provided) => ({
      ...provided,
      color: theme.palette.text.secondary
    }),
    indicatorSeparator: () => ({
      display: 'none'
    })
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 2 }}>
      <Card 
        elevation={5}
        sx={{ 
          borderRadius: 4,
          overflow: 'hidden',
          background: theme.palette.mode === 'dark' 
            ? `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.grey[900]})`
            : `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.grey[100]})`
        }}
      >
        <Box 
          sx={{ 
            p: 3, 
            background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <TrendingUpIcon sx={{ fontSize: 36, color: '#fff' }} />
          <Typography variant="h4" fontWeight="bold" color="#fff">
            Nuovo Investimento
          </Typography>
        </Box>
        
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} variant="filled">
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Asset selection */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  fontWeight: 500,
                  color: theme.palette.text.primary
                }}>
                  <SearchIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  Seleziona Asset
                </Typography>
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={loadOptions}
                  onChange={option => setSelectedAsset(option)}
                  placeholder="Cerca asset (es. AAPL, MSFT, AMZN)..."
                  styles={customSelectStyles}
                  noOptionsMessage={() => "Inizia a digitare per cercare asset..."}
                  loadingMessage={() => "Ricerca in corso..."}
                />
              </Grid>
              
              {/* Asset info box - visible when asset is selected */}
              {selectedAsset && (
                <Grid item xs={12}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      backgroundColor: theme.palette.primary.main + '15',
                      border: `1px solid ${theme.palette.primary.main}30`
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ShowChartIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography variant="subtitle1" fontWeight="bold">
                          {selectedAsset.name} ({selectedAsset.value})
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {selectedAsset.exchange}
                      </Typography>
                    </Box>
                    
                    {assetInfo?.loading && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                        <CircularProgress size={20} />
                      </Box>
                    )}
                    
                    {assetInfo?.data && (
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="body2">
                          <strong>Prezzo di mercato:</strong> €{assetInfo.data.price.toFixed(2)}
                        </Typography>
                        {assetInfo.data.change != null && (
                          <Typography 
                            variant="body2"
                            sx={{ 
                              color: assetInfo.data.change >= 0 
                                ? theme.palette.success.main
                                : theme.palette.error.main
                            }}
                          >
                            {assetInfo.data.change >= 0 ? '+' : ''}
                            {assetInfo.data.change.toFixed(2)} €
                            ({assetInfo.data.change >= 0 ? '+' : ''}
                            {assetInfo.data.changePercent.toFixed(2)}%)
                          </Typography>
                        )}
                      </Box>
                    )}
                    
                    {assetInfo?.error && (
                      <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        {assetInfo.error}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              )}
              
              {/* Input fields */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quantità"
                  name="Quantity"
                  type="number"
                  value={investment.Quantity}
                  onChange={handleQuantityChange}
                  required
                  inputProps={{ step: "0.01", min: "0" }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2 
                    } 
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalculateIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prezzo Totale"
                  name="Price"
                  type="number"
                  value={investment.Price}
                  disabled={true} // Campo disabilitato per la modifica
                  required
                  inputProps={{ step: "0.01", min: "0" }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2 
                    },
                    '& .Mui-disabled': {
                      backgroundColor: theme.palette.action.disabledBackground,
                      WebkitTextFillColor: theme.palette.text.primary,
                      opacity: 0.8,
                      cursor: 'not-allowed'
                    }
                  }}
                  InputProps={{
                    readOnly: true, // Campo in sola lettura
                    startAdornment: (
                      <InputAdornment position="start">
                        <MoneyIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        €
                      </InputAdornment>
                    ),
                  }}
                  helperText="Calcolato automaticamente dalla quantità e dal prezzo unitario"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Data di Acquisto"
                  name="Date"
                  type="date"
                  value={investment.Date}
                  onChange={e => setInvestment({ ...investment, Date: e.target.value })}
                  required
                  InputLabelProps={{ 
                    shrink: true
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2 
                    } 
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {/* Unit Price Info */}
              {investment.unitPrice > 0 && (
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: theme.palette.info.main + '15',
                    border: `1px solid ${theme.palette.info.main}30`,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <InfoOutlinedIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                    <Typography variant="body2">
                      Prezzo unitario: <strong>€{investment.unitPrice.toFixed(2)}</strong> per azione
                    </Typography>
                    <Tooltip title="Questo è il prezzo di mercato per ogni azione alla data selezionata">
                      <IconButton size="small" sx={{ ml: 0.5 }} color="info">
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
              )}

              {/* Actions */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  gap: 2, 
                  mt: 2 
                }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (onAdded) {
                        onAdded();
                      } else {
                        navigate('/dashboard');
                      }
                    }}
                    startIcon={<ArrowBackIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    Annulla
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !selectedAsset}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    sx={{ 
                      borderRadius: 2,
                      px: 4,
                      py: 1.2,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                      boxShadow: theme.shadows[4]
                    }}
                  >
                    {loading ? 'Salvataggio...' : 'Registra Investimento'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddInvestmentPage;
