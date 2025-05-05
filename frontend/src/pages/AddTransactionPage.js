import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid,
  Box,
  Paper,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  useTheme,
  Snackbar,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  FormHelperText
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Close as CloseIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  SwapHoriz as SwapHorizIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { addTransaction } from '../services/transactionService';
import { createCategory, getCategories } from '../services/categoryService';

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
  
  // New category dialog state
  const [newCategoryDialog, setNewCategoryDialog] = useState({
    open: false,
    name: '',
    loading: false,
    error: null
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
  
  // Handle opening the new category dialog
  const handleOpenNewCategoryDialog = () => {
    setNewCategoryDialog(prev => ({
      ...prev,
      open: true,
      name: '',
      error: null
    }));
  };
  
  // Handle closing the new category dialog
  const handleCloseNewCategoryDialog = () => {
    setNewCategoryDialog(prev => ({
      ...prev,
      open: false
    }));
  };
  
  // Handle new category name change
  const handleNewCategoryNameChange = (e) => {
    setNewCategoryDialog(prev => ({
      ...prev,
      name: e.target.value,
      error: null
    }));
  };
  
  // Handle creating a new category
  const handleCreateCategory = async () => {
    // Validate category name
    if (!newCategoryDialog.name.trim()) {
      setNewCategoryDialog(prev => ({
        ...prev,
        error: 'Il nome della categoria è richiesto'
      }));
      return;
    }
    
    try {
      setNewCategoryDialog(prev => ({
        ...prev,
        loading: true,
        error: null
      }));
      
      const newCategory = await createCategory({
        name: newCategoryDialog.name.trim()
      });
      
      // Update categories list
      setCategories(prev => [...prev, newCategory]);
      
      // Select the new category
      setFormData(prev => ({
        ...prev,
        categoryId: newCategory.categoryId
      }));
      
      // Close dialog
      setNewCategoryDialog(prev => ({
        ...prev,
        open: false,
        loading: false
      }));
      
      showSnackbar('Categoria creata con successo', 'success');
    } catch (error) {
      console.error('Error creating category:', error);
      setNewCategoryDialog(prev => ({
        ...prev,
        loading: false,
        error: 'Errore nella creazione della categoria: ' + (error.message || 'Riprova più tardi')
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
                  <ToggleButton 
                    value="2" 
                    aria-label="trasferimento"
                    sx={{ 
                      minWidth: '100px',
                      color: 'info.main',
                      '&.Mui-selected': {
                        backgroundColor: 'info.light',
                        color: 'info.contrastText',
                        '&:hover': {
                          backgroundColor: 'info.main',
                        }
                      }
                    }}
                  >
                    <SwapHorizIcon sx={{ mr: 1 }} />
                    Trasferimento
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
                <InputLabel id="category-label">Categoria</InputLabel>
                <Select
                  labelId="category-label"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  sx={{ borderRadius: 2 }}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton 
                        size="small" 
                        onClick={handleOpenNewCategoryDialog}
                        sx={{ 
                          mr: 2,
                          bgcolor: theme.palette.primary.light + '20',
                          '&:hover': { bgcolor: theme.palette.primary.light + '40' }
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">
                    <em>Nessuna categoria</em>
                  </MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category.categoryId} value={category.categoryId}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {errors.categoryId || 'Seleziona una categoria o crea una nuova'}
                </FormHelperText>
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
      
      {/* New Category Dialog */}
      <Dialog open={newCategoryDialog.open} onClose={handleCloseNewCategoryDialog}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AddIcon sx={{ mr: 1 }} />
            Crea nuova categoria
          </Box>
        </DialogTitle>
        <DialogContent>
          {newCategoryDialog.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {newCategoryDialog.error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Nome categoria"
            fullWidth
            variant="outlined"
            value={newCategoryDialog.name}
            onChange={handleNewCategoryNameChange}
            disabled={newCategoryDialog.loading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewCategoryDialog} disabled={newCategoryDialog.loading}>
            Annulla
          </Button>
          <Button 
            onClick={handleCreateCategory} 
            color="primary" 
            variant="contained"
            disabled={newCategoryDialog.loading}
            startIcon={newCategoryDialog.loading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {newCategoryDialog.loading ? 'Creando...' : 'Crea'}
          </Button>
        </DialogActions>
      </Dialog>
      
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

