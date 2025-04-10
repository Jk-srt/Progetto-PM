import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import './AddTransactionPage.css';

const AddTransactionPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [transaction, setTransaction] = useState({
    Description: '',
    Amount: '',
    categoryId: '',
    type: 'Expense',
    currency: 'EUR',
    date:new Date().toISOString()
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const storedCategories = localStorage.getItem('categories');
      if (storedCategories) {
        const parsedCategories = JSON.parse(storedCategories);
        setCategories(parsedCategories);
      }
    } catch (err) {
      console.error('Errore nel caricamento delle categorie:', err);
      setError('Errore nel caricamento delle categorie');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransaction(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log('token',localStorage.getItem('token'));
    console.log('userId',localStorage.getItem('userId')); 
    console.log(transaction); // Debug: verifica i dati della transazione
    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'userId': localStorage.getItem('userId') // Aggiungi questo header
          },
          body: JSON.stringify({
            // Se il backend non si aspetta la proprietà nesting "transaction", invia direttamente i campi
            Description: transaction.Description,
            Amount: parseFloat(transaction.Amount),
            CategoryId: transaction.categoryId,
            Type: transaction.type, // Ora è già un numero (0, 1 o 2)
            Currency: transaction.currency,
            Date: `${transaction.date}T00:00:00Z`
          })
      });
      
      // Verifica se la risposta è OK
      if (!response.ok) {
          // Tenta di leggere la risposta come testo per il debug
          const errorText = await response.text();
          console.error('Risposta del server:', errorText);
          throw new Error(`Errore HTTP: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Transazione registrata con successo:', data);
  
      // Reindirizzamento a /dashboard se la risposta è OK
      navigate('/dashboard');
    } catch (error) {
        console.error('Errore completo:', error);
        setError(error.message);
    }
    finally {
        setLoading(false);
    }
  };

  return (
    <Box className="add-transaction-container" sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card sx={{ 
        borderRadius: 3,
        bgcolor: '#1e1e1e',
        boxShadow: '0px 8px 24px rgba(0,0,0,0.12)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              mb: 4,
              color: '#8eb8e5',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            Nuova Transazione
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrizione"
                name="Description"
                value={transaction.Description}  // a questo modo
                onChange={handleChange}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#2c2c2c'
                  }
                }}
              />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Importo"
                  name="Amount"
                  type="number"
                  value={transaction.Amount}
                  onChange={handleChange}
                  required
                  inputProps={{ step: "0.01" }}
                  InputProps={{
                    startAdornment: (
                      <Typography sx={{ mr: 1, color: '#8eb8e5' }}>
                        €
                      </Typography>
                    ),
                    sx: {
                      backgroundColor: '#2c2c2c'
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#8eb8e5' }}>Tipo</InputLabel>
                  <Select
                    name="type"
                    value={transaction.type}
                    onChange={handleChange}
                    required
                    sx={{
                      backgroundColor: '#2c2c2c'
                    }}
                  >
                    <MenuItem value={0}>Entrata</MenuItem>
                    <MenuItem value={1}>Uscita</MenuItem>
                    <MenuItem value={2}>Trasferimento</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#8eb8e5' }}>Categoria</InputLabel>
                  <Select
                    name="categoryId"
                    value={transaction.categoryId}
                    onChange={handleChange}
                    required
                    displayEmpty
                    sx={{
                      backgroundColor: '#2c2c2c'
                    }}
                  >
                    <MenuItem value="" disabled>
                      Seleziona categoria
                    </MenuItem>
                    {categories.map(category => (
                      <MenuItem 
                        key={category.categoryId} 
                        value={category.categoryId}
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        <Box 
                          sx={{
                            width: 12,
                            height: 12,
                            bgcolor: category.color || '#8eb8e5',
                            mr: 2,
                            borderRadius: '50%'
                          }}
                        />
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data"
                  name="date"
                  type="date"
                  value={transaction.date}
                  onChange={handleChange}
                  InputLabelProps={{ 
                    shrink: true,
                    sx: { color: '#8eb8e5' } 
                  }}
                  required
                  InputProps={{
                    sx: {
                      borderRadius: 2,
                      backgroundColor: '#2c2c2c'
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 2,
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    backgroundColor: '#8eb8e5',
                    color: '#121212',
                    '&:hover': {
                      backgroundColor: '#a0c4ea'
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Registra Transazione'
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddTransactionPage;
