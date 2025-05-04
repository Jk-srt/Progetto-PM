import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import { fetchListingStatus, fetchQuoteOnNearestTradingDate } from '../services/YahooFinanceService';
import InvestmentService from '../services/InvestmentService';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField,
  Button,
  Grid, CircularProgress, Alert
} from '@mui/material';

const AddInvestmentPage = ({onAdded}) => {
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

  // Carica simboli da YahooFinanceService
  const loadOptions = async (inputValue) => {
    if (!inputValue) return [];
    const list = await fetchListingStatus(inputValue);
    return list.map(item => ({
      label: `${item.name} (${item.symbol})`,
      value: item.symbol,
      name: item.name,
      type: item.type,
      exchange: item.exchange
    }));
  };

  // Quando cambia asset o data, aggiorna unitPrice e ricalcola Price/Quantity
  useEffect(() => {
    if (!selectedAsset || !investment.Date) return;
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
      })
      .catch(err => console.error(err));
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

  const handlePriceChange = (e) => {
    const price = parseFloat(e.target.value) || 0;
    setInvestment(prev => ({
      ...prev,
      Price: e.target.value,
      Quantity: prev.unitPrice ? (price / prev.unitPrice).toFixed(2) : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    // costruisci il payload in camelCase
    const payload = {
      quantity:    parseFloat(investment.Quantity),
      purchasePrice: parseFloat(investment.Price),
      currentPrice:  0,
      // genera un ISO string corretto in UTC
      purchaseDate:  new Date(investment.Date).toISOString(),
      action:        0,                         // 0 = Buy
      assetName:     selectedAsset.value       // camelCase
    };
  
    try {
      // assicurati che create invii:
      // axios.post('/api/investments', payload, { headers: { userId: … }})
      await InvestmentService.create(payload);
      if (onAdded) {
        onAdded();
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card sx={{ borderRadius: 3, bgcolor: '#1e1e1e' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#8eb8e5', textAlign: 'center' }}>
            Nuovo Investimento
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={loadOptions}
                  onChange={option => setSelectedAsset(option)}
                  placeholder="Cerca asset (es. AAPL)…"
                  styles={{
                    control: base => ({
                      ...base,
                      padding: '6px',
                      borderRadius: 6,
                      fontSize: '16px',
                      backgroundColor: '#2c2c2c'
                    })
                  }}
                  theme={theme => ({
                    ...theme,
                    colors: { ...theme.colors, primary25: '#444', primary: '#8eb8e5' }
                  })}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Quantità"
                  name="Quantity"
                  type="number"
                  value={investment.Quantity}
                  onChange={handleQuantityChange}
                  required
                  inputProps={{ step: "0.01" }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#2c2c2c' } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Prezzo"
                  name="Price"
                  type="number"
                  value={investment.Price}
                  onChange={handlePriceChange}
                  required
                  inputProps={{ step: "0.01" }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#2c2c2c' } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data"
                  name="Date"
                  type="date"
                  value={investment.Date}
                  onChange={e => setInvestment({ ...investment, Date: e.target.value })}
                  required
                  InputLabelProps={{ shrink: true, sx: { color: '#8eb8e5' } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#2c2c2c' } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{ py: 2, borderRadius: 2, fontSize: '1.1rem', backgroundColor: '#8eb8e5', color: '#121212' }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Registra Investimento'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddInvestmentPage;
