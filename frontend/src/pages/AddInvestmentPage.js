import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { fetchListingStatus, fetchQuoteOnNearestTradingDate } from '../services/YahooFinanceService';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField,
  Button, FormControl, InputLabel, Select, MenuItem,
  Grid, CircularProgress, Alert
} from '@mui/material';

const AddInvestmentPage = () => {
  const navigate = useNavigate();
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [investment, setInvestment] = useState({
    Type: 0,
    Quantity: '',
    Price: '',
    Date: new Date().toISOString().split('T')[0],
    unitPrice: 0             // ← aggiunto campo per prezzo unitario
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // carica simboli da YahooFinanceService
  const loadOptions = async (inputValue) => {
    if (!inputValue) {
      return []; // oppure un elenco base
    }
    const list = await fetchListingStatus(inputValue);
    return list.map(item => ({
      label: `${item.name} (${item.symbol})`,
      value: item.symbol,
      name: item.name,
      type: item.type,
      exchange: item.exchange
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await fetch('http://localhost:5000/api/investments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'userId': localStorage.getItem('userId')
        },
        body: JSON.stringify({
          Asset: selectedAsset?.value,
          Type: investment.Type,
          Quantity: parseFloat(investment.Quantity),
          Price: parseFloat(investment.Price),
          Date: `${investment.Date}T00:00:00Z`
        })
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // al cambio di asset o data, carica unitPrice e imposta Price = unitPrice * Quantity (se presente) o unitPrice
  React.useEffect(() => {
    if (selectedAsset && investment.Date) {
      fetchQuoteOnNearestTradingDate(selectedAsset.value, investment.Date)
        .then(data => {
          const up = data.price ?? 0;
          setInvestment(prev => ({
            ...prev,
            unitPrice: up,
            Price: prev.Quantity
              ? (up * parseFloat(prev.Quantity)).toFixed(2)
              : up.toString()
          }));
        })
        .catch(() => {});
    }
  }, [selectedAsset, investment.Date]);

  // al cambio di Quantity, ricalcola Price = unitPrice * Quantity
  React.useEffect(() => {
    const q = parseFloat(investment.Quantity);
    if (!isNaN(q) && investment.unitPrice) {
      setInvestment(prev => ({
        ...prev,
        Price: (prev.unitPrice * q).toFixed(2)
      }));
    }
  }, [investment.Quantity]);

  // al cambio di Price, ricalcola Quantity = Price / unitPrice
  React.useEffect(() => {
    const p = parseFloat(investment.Price);
    if (!isNaN(p) && investment.unitPrice) {
      setInvestment(prev => ({
        ...prev,
        Quantity: (p / prev.unitPrice).toFixed(2)
      }));
    }
  }, [investment.Price]);

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
              {/* replace TextField Asset with AsyncSelect */}
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
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#8eb8e5' }}>Tipo</InputLabel>
                  <Select
                    name="Type"
                    value={investment.Type}
                    onChange={e => setInvestment({ ...investment, Type: e.target.value })}
                    required
                    sx={{ backgroundColor: '#2c2c2c' }}
                  >
                    <MenuItem value={0}>Acquisto</MenuItem>
                    <MenuItem value={1}>Vendita</MenuItem>
                    <MenuItem value={2}>Trasferimento</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Quantità"
                  name="Quantity"
                  type="number"
                  value={investment.Quantity}
                  onChange={e => setInvestment({ ...investment, Quantity: e.target.value })}
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
                  onChange={e => setInvestment({ ...investment, Price: e.target.value })}
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
