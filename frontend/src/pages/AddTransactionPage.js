import React, { useState } from 'react';
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
  Grid 
} from '@mui/material';

const AddTransactionPage = ({ categories = [] }) => {
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState({
    description: '',
    amount: '',
    categoryId: '',
    type: 'Expense',
    currency: 'EUR',
    date: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransaction({
      ...transaction,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(transaction)
      });
      
      if (response.ok) {
        navigate('/dashboard'); // Redirect alla dashboard dopo invio
      } else {
        throw new Error('Errore nell\'aggiunta della transazione');
      }
    } catch (error) {
      console.error('Errore aggiunta transazione:', error);
      // Gestione errore (mostra messaggio all'utente)
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Aggiungi Transazione
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrizione"
                name="description"
                value={transaction.description}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Importo"
                name="amount"
                type="number"
                value={transaction.amount}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  name="type"
                  value={transaction.type}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="Income">Entrata</MenuItem>
                  <MenuItem value="Expense">Uscita</MenuItem>
                  <MenuItem value="Transfer">Trasferimento</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Categoria</InputLabel>
                <Select
                  name="categoryId"
                  value={transaction.categoryId}
                  onChange={handleChange}
                  required
                >
                  {categories.map(category => (
                    <MenuItem key={category.categoryId} value={category.categoryId}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Valuta"
                name="currency"
                value={transaction.currency}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Data"
                name="date"
                type="date"
                value={transaction.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Salva Transazione
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddTransactionPage;
