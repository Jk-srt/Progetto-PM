import React, { useState, useContext, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { useAuth } from '../context/AuthProvider';
import { SnackbarContext } from '../context/SnackbarContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AddTransactionButton = ({ onTransactionAdded }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const { showSnackbar } = useContext(SnackbarContext);
  const [categories, setCategories] = useState([]);
  
  const initialFormState = {
    date: new Date(),
    description: '',
    categoryId: '',
    amount: '',
    currency: 'EUR',
    type: 'Expense'
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.description.trim()) errors.description = 'Campo obbligatorio';
    if (isNaN(formData.amount) || formData.amount <= 0) errors.amount = 'Importo non valido';
    if (!formData.categoryId) errors.categoryId = 'Seleziona una categoria';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
        const idToken = await currentUser.getIdToken();
        const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
                ...formData,
                date: formData.date.toISOString(),
                amount: parseFloat(formData.amount),
                currency: 'EUR'
            })
        });

        const responseData = await response.json();
        if (!response.ok) throw new Error(responseData.message || 'Errore server');

        showSnackbar('Transazione registrata', 'success');
        onTransactionAdded(responseData);
        setOpen(false);
        setFormData(initialFormState);
    } catch (err) {
        showSnackbar(`Errore: ${err.message}`, 'error');
    } finally {
        setLoading(false);
    }
};


  return (
    <>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        ＋ Nuova Transazione
      </Button>
      
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Aggiungi Transazione</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <DatePicker
                selected={formData.date}
                onChange={(date) => setFormData({ ...formData, date })}
                dateFormat="dd/MM/yyyy"
                customInput={<TextField fullWidth label="Data" />}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo Transazione</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Tipo Transazione"
                >
                  <MenuItem value="Income">Entrata</MenuItem>
                  <MenuItem value="Expense">Uscita</MenuItem>
                  <MenuItem value="Transfer">Trasferimento</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Descrizione"
                fullWidth
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                error={!!formErrors.description}
                helperText={formErrors.description}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Importo"
                type="number"
                fullWidth
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                InputProps={{ inputProps: { step: "0.01" } }}
                error={!!formErrors.amount}
                helperText={formErrors.amount}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.categoryId}>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  label="Categoria"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.categoryId} value={category.categoryId}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.categoryId && (
                  <span style={{ color: '#d32f2f', fontSize: '0.75rem' }}>
                    {formErrors.categoryId}
                  </span>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="error">
            Annulla
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Conferma'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddTransactionButton;
