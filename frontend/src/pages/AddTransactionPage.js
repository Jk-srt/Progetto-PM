import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  Select, 
  MenuItem, 
  Grid,
  Box,
  Paper,
  CircularProgress,
  Divider,
  Alert,
  useTheme,
  Snackbar,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  FormHelperText
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { addTransaction } from '../services/transactionService';
import { getCategories } from '../services/categoryService';

const AddTransactionPage = ({ onAdded }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date(),
    type: 1, // 0: Income, 1: Expense, 2: Transfer
    categoryId: ''
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        showSnackbar('Impossibile caricare le categorie', 'error');
      }
    };

    fetchCategories();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descrizione è richiesta';
    }
    
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Inserisci un importo valido maggiore di zero';
    }
    
    if (!formData.date) {
      newErrors.date = 'La data è richiesta';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prevData => ({
      ...prevData,
      date
    }));
    
    if (errors.date) {
      setErrors(prevErrors => ({
        ...prevErrors,
        date: null
      }));
    }
  };
  
  const handleTypeChange = (event, newType) => {
    // Don't allow null selection
    if (newType !== null) {
      setFormData(prevData => ({
        ...prevData,
        type: parseInt(newType),
        amount: Math.abs(parseFloat(prevData.amount) || 0)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Adjust amount sign based on transaction type
      let finalAmount = Math.abs(parseFloat(formData.amount));
      if (formData.type === 1) { // Expense
        finalAmount *= -1;
      }
      
      const newTransaction = {
        ...formData,
        amount: finalAmount,
        categoryId: formData.categoryId || null
      };
      
      await addTransaction(newTransaction);
      
      showSnackbar('Transazione aggiunta con successo!', 'success');
      
      // Reset form
      setFormData({
        description: '',
        amount: '',
        date: new Date(),
        type: 1,
        categoryId: ''
      });
      
      // Notify parent component if needed
      if (onAdded) {
        onAdded();
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      showSnackbar(`Errore: ${error.message || 'Si è verificato un errore durante il salvataggio della transazione'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 2, maxWidth: '100%' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          mb: 2
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom sx={{ 
          pb: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          color: theme.palette.primary.main,
          fontWeight: 600
        }}>
          <SaveIcon sx={{ mr: 1 }} /> Nuova Transazione
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Transaction type selection */}
            <Grid item xs={12}>
              <Box sx={{ 
                mb: 1, 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 1
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, minWidth: '80px' }}>
                  Tipo:
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={formData.type.toString()}
                  onChange={handleTypeChange}
                  aria-label="tipo transazione"
                  size="small"
                  sx={{ flexGrow: 1 }}
                >
                  <ToggleButton 
                    value="0" 
                    aria-label="entrata" 
                    sx={{ 
                      minWidth: '100px',
                      color: 'success.main',
                      '&.Mui-selected': {
                        backgroundColor: 'success.light',
                        color: 'success.contrastText',
                        '&:hover': {
                          backgroundColor: 'success.main',
                        }
                      }
                    }}
                  >
                    <ArrowUpwardIcon sx={{ mr: 1 }} />
                    Entrata
                  </ToggleButton>
                  <ToggleButton 
                    value="1" 
                    aria-label="uscita"
                    sx={{ 
                      minWidth: '100px',
                      color: 'error.main',
                      '&.Mui-selected': {
                        backgroundColor: 'error.light',
                        color: 'error.contrastText',
                        '&:hover': {
                          backgroundColor: 'error.main',
                        }
                      }
                    }}
                  >
                    <ArrowDownwardIcon sx={{ mr: 1 }} />
                    Uscita
                  </ToggleButton>
                  
                </ToggleButtonGroup>
              </Box>
            </Grid>
            
            {/* Description and Amount */}
            <Grid item xs={12} md={6}>
              <TextField
                name="description"
                label="Descrizione"
                fullWidth
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="amount"
                label="Importo"
                fullWidth
                type="number"
                value={formData.amount}
                onChange={handleChange}
                error={!!errors.amount}
                helperText={errors.amount}
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>
            
            {/* Date and Category */}
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Data"
                  value={formData.date}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.date,
                      helperText: errors.date,
                      sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.categoryId}>
                <Select
                  labelId="category-label"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  displayEmpty
                  sx={{
                    borderRadius: 2,
                    height: '56px', // Match TextField height
                    '.MuiOutlinedInput-notchedOutline': {
                      borderRadius: 2
                    }
                  }}
                >
                  <MenuItem value="" disabled>
                    <em>Seleziona una categoria</em>
                  </MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category.categoryId} value={category.categoryId}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.categoryId || ' '}</FormHelperText>
              </FormControl>
            </Grid>
            
            {/* Submit button */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (onAdded) {
                      onAdded();
                    } else {
                      navigate('/dashboard');
                    }
                  }}
                  startIcon={<CloseIcon />}
                  disabled={loading}
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color={formData.type === 0 ? 'success' : formData.type === 1 ? 'error' : 'primary'}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={loading}
                >
                  {loading ? 'Salvataggio...' : 'Salva'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddTransactionPage;

