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
  Grid,
  CircularProgress,
  Box,
  Typography,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  Alert
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import itLocale from 'date-fns/locale/it';
import { createCategory, getCategories } from '../services/categoryService';

const EditTransactionDialog = ({ 
  open, 
  onClose, 
  transaction, 
  categories: propCategories, 
  onSave,
  loading
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    transactionId: 0,
    date: new Date(),
    description: '',
    amount: '',
    type: 1, // 0 = entrata, 1 = spesa, 2 = trasferimento
    categoryId: ''
  });

  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  
  // Stato per il dialogo di nuova categoria
  const [newCategoryDialog, setNewCategoryDialog] = useState({
    open: false,
    name: '',
    loading: false,
    error: null
  });

  // Carica categorie all'apertura del dialogo
  useEffect(() => {
    if (transaction) {
      setFormData({
        transactionId: transaction.transactionId,
        date: new Date(transaction.date),
        description: transaction.description || '',
        // Se è negativo, è una spesa (type=1), altrimenti è un'entrata (type=0)
        amount: Math.abs(transaction.amount).toString(),
        type: transaction.amount < 0 ? 1 : 0,
        categoryId: transaction.categoryId
      });
      setErrors({});
    }
  }, [transaction]);

  // Carica categorie all'apertura del dialogo
  useEffect(() => {
    if (open) {
      const loadCategories = async () => {
        try {
          // Se le categorie sono fornite come prop, usale
          if (propCategories && propCategories.length > 0) {
            setCategories(propCategories);
          } else {
            // Altrimenti carica le categorie dal servizio
            const fetchedCategories = await getCategories();
            setCategories(fetchedCategories);
            console.log("Categorie caricate:", fetchedCategories);
          }
        } catch (error) {
          console.error("Errore nel caricamento delle categorie:", error);
        }
      };

      loadCategories();
    }
  }, [open, propCategories]);

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
  
  // Handler per chiudere il dialogo di nuova categoria
  const handleCloseNewCategoryDialog = () => {
    setNewCategoryDialog(prev => ({
      ...prev,
      open: false
    }));
  };
  
  // Handler per il cambio del nome della categoria
  const handleNewCategoryNameChange = (e) => {
    setNewCategoryDialog(prev => ({
      ...prev,
      name: e.target.value,
      error: null
    }));
  };
  
  // Handler per creare una nuova categoria
  const handleCreateCategory = async () => {
    // Validazione del nome categoria
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
      
      // Aggiorna la lista delle categorie localmente
      setCategories(prev => [...prev, newCategory]);
      
      // Seleziona la nuova categoria
      setFormData(prev => ({
        ...prev,
        categoryId: newCategory.categoryId
      }));
      
      // Chiudi il dialogo
      setNewCategoryDialog(prev => ({
        ...prev,
        open: false,
        loading: false
      }));
      
    } catch (error) {
      console.error('Error creating category:', error);
      setNewCategoryDialog(prev => ({
        ...prev,
        loading: false,
        error: 'Errore nella creazione della categoria: ' + (error.message || 'Riprova più tardi')
      }));
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle
        sx={{
          p: 3,
          background: 'transparent',
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="h5" component="h1" sx={{ 
          display: 'flex',
          alignItems: 'center',
          color: theme.palette.primary.main,
          fontWeight: 600
        }}>
          <SaveIcon sx={{ mr: 1 }} /> 
          {transaction ? 'Modifica Transazione' : 'Nuova Transazione'}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
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

          {/* Description and Amount (side by side) */}
          <Grid item xs={12} md={6}>
            <TextField
              name="description"
              label="Descrizione"
              value={formData.description}
              onChange={handleChange}
              fullWidth
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
              value={formData.amount}
              onChange={handleChange}
              fullWidth
              type="number"
              error={!!errors.amount}
              helperText={errors.amount}
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
                sx: { borderRadius: 2 },
                inputProps: { min: 0, step: 0.01 }
              }}
            />
          </Grid>

          {/* Date and Category */}
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={itLocale}>
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
                sx={{ 
                  borderRadius: 2,
                  height: '56px' // Match TextField height
                }}
              >
                <MenuItem value="">
                </MenuItem>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <MenuItem key={category.categoryId} value={category.categoryId}>
                      {category.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Caricamento categorie...</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions 
        sx={{ 
          px: 3, 
          pb: 3,
          pt: 0,
          bgcolor: 'transparent',
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, width: '100%', mt: 1 }}>
          <Button
            onClick={onClose}
            startIcon={<CloseIcon />}
            variant="outlined"
            disabled={loading}
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            Annulla
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color={formData.type === 0 ? 'success' : 'error'}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={loading}
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            {loading ? 'Salvataggio...' : 'Salva'}
          </Button>
        </Box>
      </DialogActions>

      {/* Dialogo per la creazione di nuove categorie */}
      <Dialog 
        open={newCategoryDialog.open} 
        onClose={handleCloseNewCategoryDialog}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AddIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Crea nuova categoria</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 0, px: 2 }}>
          {newCategoryDialog.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {newCategoryDialog.error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="normal"
            label="Nome categoria"
            fullWidth
            variant="outlined"
            value={newCategoryDialog.name}
            onChange={handleNewCategoryNameChange}
            disabled={newCategoryDialog.loading}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={handleCloseNewCategoryDialog} 
            disabled={newCategoryDialog.loading}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleCreateCategory} 
            color="primary" 
            variant="contained"
            disabled={newCategoryDialog.loading}
            startIcon={newCategoryDialog.loading ? <CircularProgress size={20} /> : <AddIcon />}
            sx={{ borderRadius: 2 }}
          >
            {newCategoryDialog.loading ? 'Creando...' : 'Crea'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default EditTransactionDialog;

