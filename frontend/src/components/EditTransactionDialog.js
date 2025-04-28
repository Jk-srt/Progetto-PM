import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  CircularProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import itLocale from 'date-fns/locale/it';

const EditTransactionDialog = ({ 
  open, 
  onClose, 
  transaction, 
  categories, 
  onSave,
  loading
}) => {
  const [formData, setFormData] = useState({
    transactionId: 0,
    date: new Date(),
    description: '',
    amount: '',
    type: 1, // 0 = entrata, 1 = spesa
    categoryId: '',
    method: ''
  });

  const [errors, setErrors] = useState({});

  // Quando la transazione cambia (apertura dialogo con nuova transazione)
  useEffect(() => {
    if (transaction) {
      setFormData({
        transactionId: transaction.transactionId,
        date: new Date(transaction.date),
        description: transaction.description || '',
        // Se è negativo, è una spesa (type=1), altrimenti è un'entrata (type=0)
        amount: Math.abs(transaction.amount).toString(),
        type: transaction.amount < 0 ? 1 : 0,
        categoryId: transaction.categoryId,
        method: transaction.method || ''
      });
      setErrors({});
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Reset validation error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleDateChange = (newDate) => {
    setFormData({ ...formData, date: newDate });
    
    // Reset validation error for date
    if (errors.date) {
      setErrors({ ...errors, date: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.date) {
      newErrors.date = 'La data è obbligatoria';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descrizione è obbligatoria';
    }
    
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "L'importo deve essere un numero maggiore di zero";
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'La categoria è obbligatoria';
    }
    
    if (!formData.method.trim()) {
      newErrors.method = 'Il metodo di pagamento è obbligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const numericAmount = parseFloat(formData.amount);
      
      onSave({
        ...formData,
        amount: formData.type === 1 ? -numericAmount : numericAmount
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {transaction ? 'Modifica Transazione' : 'Nuova Transazione'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={itLocale}>
              <DatePicker
                label="Data"
                value={formData.date}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!errors.date}
                    helperText={errors.date}
                  />
                )}
                format="dd/MM/yyyy"
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="description"
              label="Descrizione"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              error={!!errors.description}
              helperText={errors.description}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.type}>
              <InputLabel>Tipo</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Tipo"
              >
                <MenuItem value={0}>Entrata</MenuItem>
                <MenuItem value={1}>Spesa</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              name="amount"
              label="Importo (€)"
              value={formData.amount}
              onChange={handleChange}
              fullWidth
              type="number"
              error={!!errors.amount}
              helperText={errors.amount}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.categoryId}>
              <InputLabel>Categoria</InputLabel>
              <Select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                label="Categoria"
              >
                {categories.map((category) => (
                  <MenuItem key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.categoryId && <FormHelperText>{errors.categoryId}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              name="method"
              label="Metodo di pagamento"
              value={formData.method}
              onChange={handleChange}
              fullWidth
              error={!!errors.method}
              helperText={errors.method}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annulla
        </Button>
        <Button onClick={handleSubmit} color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Salva'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTransactionDialog;
