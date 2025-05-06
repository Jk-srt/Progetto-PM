import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  Fab,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  InputAdornment,
  Button,
  Collapse,
  Divider,
  Chip,
  Paper,
  FormGroup,
  FormControlLabel,
  Checkbox,
  OutlinedInput
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  DateRange as DateRangeIcon,
  Category as CategoryIcon,
  Payments as PaymentsIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { getTransactions, updateTransaction, deleteTransaction } from "../services/transactionService";
import EditTransactionDialog from "../components/EditTransactionDialog";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import AddTransactionPage from "./AddTransactionPage";

export default function TransactionsPage({ transactions: propTransactions = [], categories = [], onTransactionsChange }) {
  const [transactions, setTransactions] = useState(propTransactions);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [openAddTx, setOpenAddTx] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [filterCategories, setFilterCategories] = useState([]);
  const [filterTypes, setFilterTypes] = useState({
    entrata: true,
    uscita: true,
    transferimento: true
  });
  const [filterAmount, setFilterAmount] = useState({
    min: '',
    max: ''
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const navigate = useNavigate();

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(data);
      setFilteredTransactions(data);
    } catch (error) {
      showSnackbar(`Errore nel caricamento delle transazioni: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to apply all filters - moved here before any usage
  const applyFilters = useCallback(() => {
    let result = [...transactions];
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(tx => 
        tx.description?.toLowerCase().includes(query) || 
        (tx.category?.name || '').toLowerCase().includes(query)
      );
    }
    
    // Apply date range filter
    if (filterStartDate) {
      const startDate = new Date(filterStartDate);
      startDate.setHours(0, 0, 0, 0);
      result = result.filter(tx => new Date(tx.date) >= startDate);
    }
    
    if (filterEndDate) {
      const endDate = new Date(filterEndDate);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(tx => new Date(tx.date) <= endDate);
    }
    
    // Apply category filter
    if (filterCategories.length > 0) {
      result = result.filter(tx => 
        filterCategories.includes(tx.category?.categoryId || 'null')
      );
    }
    
    // Apply transaction type filter
    const enabledTypes = [];
    if (filterTypes.entrata) enabledTypes.push(0);
    if (filterTypes.uscita) enabledTypes.push(1);
    if (filterTypes.transferimento) enabledTypes.push(2);
    
    if (enabledTypes.length < 3) { // Only apply if not all types are selected
      result = result.filter(tx => enabledTypes.includes(tx.type));
    }
    
    // Apply amount filter
    if (filterAmount.min !== '') {
      const minAmount = parseFloat(filterAmount.min);
      result = result.filter(tx => Math.abs(tx.amount) >= minAmount);
    }
    
    if (filterAmount.max !== '') {
      const maxAmount = parseFloat(filterAmount.max);
      result = result.filter(tx => Math.abs(tx.amount) <= maxAmount);
    }
    
    setFilteredTransactions(result);
  }, [transactions, searchQuery, filterStartDate, filterEndDate, filterCategories, filterTypes, filterAmount]); // Added all dependencies

  // If transactions are passed as props, use those
  useEffect(() => {
    if (propTransactions.length > 0) {
      setTransactions(propTransactions);
      setFilteredTransactions(propTransactions);
    } else {
      loadTransactions();
    }
  }, [propTransactions, loadTransactions]);

  // Apply filters whenever filter values change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setFilterStartDate(null);
    setFilterEndDate(null);
    setFilterCategories([]);
    setFilterTypes({
      entrata: true,
      uscita: true,
      transferimento: true
    });
    setFilterAmount({
      min: '',
      max: ''
    });
  };

  // Calculate totals from filtered transactions
  const totalEntrate = filteredTransactions
      ?.filter(t => t.amount > 0)
      ?.reduce((sum, t) => sum + t.amount, 0) || 0;

  const totalUscite = filteredTransactions
      ?.filter(t => t.amount < 0)
      ?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

  const saldoNetto = totalEntrate - totalUscite;

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

  const handleEditClick = (transaction) => {
    setSelectedTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (transaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setSelectedTransaction(null);
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setSelectedTransaction(null);
  };

  const handleAddClick = () => {
    navigate('/add-transaction');
  };

  const handleSaveTransaction = async (updatedTransaction) => {
    try {
      setActionLoading(true);
      const savedTransaction = await updateTransaction(updatedTransaction.transactionId, updatedTransaction);
      
      // Update local transactions state
      setTransactions(transactions.map(t => 
        t.transactionId === savedTransaction.transactionId ? savedTransaction : t
      ));
      
      // Close dialog
      handleEditDialogClose();
      
      // Show success message
      showSnackbar('Transazione aggiornata con successo');
      
      // Notify parent component if needed
      if (onTransactionsChange) {
        onTransactionsChange();
      }
    } catch (error) {
      showSnackbar(`Errore nell'aggiornamento: ${error.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTransaction) return;
    
    try {
      setActionLoading(true);
      await deleteTransaction(selectedTransaction.transactionId);
      
      // Update local transactions state
      setTransactions(transactions.filter(t => t.transactionId !== selectedTransaction.transactionId));
      
      // Close dialog
      handleDeleteDialogClose();
      
      // Show success message
      showSnackbar('Transazione eliminata con successo');
      
      // Notify parent component if needed
      if (onTransactionsChange) {
        onTransactionsChange();
      }
    } catch (error) {
      showSnackbar(`Errore nell'eliminazione: ${error.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Get unique categories from transactions
  const uniqueCategories = React.useMemo(() => {
    const categoryMap = {};
    transactions.forEach(tx => {
      if (tx.category?.categoryId) {
        categoryMap[tx.category.categoryId] = tx.category;
      }
    });
    return Object.values(categoryMap);
  }, [transactions]);

  const handleCategoryChange = (event) => {
    const {
      target: { value },
    } = event;
    setFilterCategories(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <Container>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Typography variant="h4" gutterBottom>
          Storico Transazioni
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            startIcon={<FilterListIcon />} 
            color={showFilters ? "primary" : "inherit"}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtri
          </Button>
        </Box>
        
        <Dialog
          open={openAddTx}
          onClose={() => setOpenAddTx(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Nuova Transazione</DialogTitle>
          <DialogContent>
            <AddTransactionPage 
              onAdded={() => {
                setOpenAddTx(false);
                loadTransactions(); // reload data after adding
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Search and filters section */}
      <Paper sx={{ mb: 3, p: 2 }}>
        {/* Search bar - always visible */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Cerca per descrizione o categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchQuery('')} edge="end" size="small">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        {/* Collapsible filters */}
        <Collapse in={showFilters}>
          <Box sx={{ pt: 1 }}>
            <Divider sx={{ mb: 2 }}>
              <Chip label="Filtri avanzati" icon={<FilterListIcon />} />
            </Divider>
            
            <Grid container spacing={3}>
              {/* Date range */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Data iniziale"
                      value={filterStartDate}
                      onChange={setFilterStartDate}
                      renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                      slotProps={{ 
                        textField: {
                          fullWidth: true, 
                          size: "small", 
                          InputProps: { 
                            startAdornment: (
                              <InputAdornment position="start">
                                <DateRangeIcon fontSize="small" />
                              </InputAdornment>
                            )
                          }
                        }
                      }}
                    />
                    
                    <DatePicker
                      label="Data finale"
                      value={filterEndDate}
                      onChange={setFilterEndDate}
                      renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                      slotProps={{ 
                        textField: {
                          fullWidth: true, 
                          size: "small", 
                          InputProps: { 
                            startAdornment: (
                              <InputAdornment position="start">
                                <DateRangeIcon fontSize="small" />
                              </InputAdornment>
                            )
                          }
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Box>
              </Grid>
              
              {/* Categories */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="category-filter-label">Categorie</InputLabel>
                  <Select
                    labelId="category-filter-label"
                    multiple
                    value={filterCategories}
                    onChange={handleCategoryChange}
                    input={<OutlinedInput label="Categorie" />}
                    startAdornment={
                      <InputAdornment position="start">
                        <CategoryIcon fontSize="small" />
                      </InputAdornment>
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const categoryName = uniqueCategories.find(cat => cat.categoryId === value)?.name || 'Non categorizzato';
                          return <Chip key={value} label={categoryName} size="small" />;
                        })}
                      </Box>
                    )}
                  >
                    <MenuItem value="null">Non categorizzato</MenuItem>
                    {uniqueCategories.map((category) => (
                      <MenuItem key={category.categoryId} value={category.categoryId}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Transaction types and amount range */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  <PaymentsIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Tipo di transazione
                </Typography>
                <FormGroup row>
                  <FormControlLabel 
                    control={
                      <Checkbox 
                        checked={filterTypes.entrata} 
                        onChange={(e) => setFilterTypes({...filterTypes, entrata: e.target.checked})} 
                        size="small"
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                      />
                    } 
                    label={<Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowUpwardIcon fontSize="small" sx={{ color: '#4caf50', mr: 0.5 }} />
                      <Typography variant="body2">Entrate</Typography>
                    </Box>}
                  />
                  <FormControlLabel 
                    control={
                      <Checkbox 
                        checked={filterTypes.uscita} 
                        onChange={(e) => setFilterTypes({...filterTypes, uscita: e.target.checked})} 
                        size="small"
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                      />
                    } 
                    label={<Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowDownwardIcon fontSize="small" sx={{ color: '#f44336', mr: 0.5 }} />
                      <Typography variant="body2">Uscite</Typography>
                    </Box>}
                  />
                  
                </FormGroup>
              </Grid>
              
              {/* Amount range */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    label="Importo min (€)"
                    type="number"
                    size="small"
                    value={filterAmount.min}
                    onChange={(e) => setFilterAmount({...filterAmount, min: e.target.value})}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">€</InputAdornment>,
                    }}
                  />
                  <Typography variant="body1">-</Typography>
                  <TextField
                    label="Importo max (€)"
                    type="number"
                    size="small"
                    value={filterAmount.max}
                    onChange={(e) => setFilterAmount({...filterAmount, max: e.target.value})}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">€</InputAdornment>,
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<ClearIcon />} 
                onClick={resetFilters}
                sx={{ mr: 1 }}
              >
                Azzera filtri
              </Button>
            </Box>
          </Box>
        </Collapse>
        
        {/* Active filters summary */}
        {(searchQuery || filterStartDate || filterEndDate || filterCategories.length > 0 || 
          !filterTypes.entrata || !filterTypes.uscita || !filterTypes.transferimento ||
          filterAmount.min || filterAmount.max) && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Filtri attivi: {filteredTransactions.length} transazioni visualizzate su {transactions.length} totali
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Summary cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: '4px solid #4caf50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ArrowUpwardIcon sx={{ color: '#4caf50', mr: 1 }} />
                Totale Entrate
              </Typography>
              <Typography variant="h4">
                €{totalEntrate.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: '4px solid #f44336' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ArrowDownwardIcon sx={{ color: '#f44336', mr: 1 }} />
                Totale Uscite
              </Typography>
              <Typography variant="h4">
                €{totalUscite.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: '4px solid #2196f3' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Saldo Netto
              </Typography>
              <Typography
                  variant="h4"
                  sx={{ color: saldoNetto >= 0 ? '#4caf50' : '#f44336' }}
              >
                €{saldoNetto.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transactions table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <CircularProgress />
        </div>
      ) : (
        <>
          {filteredTransactions.length > 0 ? (
            <Table sx={{ minWidth: 650 }} aria-label="tabella transazioni">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Data</strong></TableCell>
                  <TableCell><strong>Descrizione</strong></TableCell>
                  <TableCell><strong>Categoria</strong></TableCell>
                  <TableCell><strong>Tipo di Pagamento</strong></TableCell>
                  <TableCell align="right"><strong>Importo</strong></TableCell>
                  <TableCell align="center"><strong>Azioni</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.transactionId}>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.category?.name || 'N/A'}</TableCell>
                    <TableCell>{transaction.type === 0 ? 'Entrata' : transaction.type === 1 ? 'Uscita' : transaction.type === 2 
                        ? 'Transferimento' : 'N/A'} </TableCell>
                    <TableCell align="right">
                      <span
                          style={{
                            color: transaction.amount > 0 ? '#4caf50' : '#f44336',
                            fontWeight: 500
                          }}
                      >
                        {transaction.amount > 0 ? '+' : '-'}€
                        {Math.abs(transaction.amount).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary" onClick={() => handleEditClick(transaction)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(transaction)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography variant="subtitle1" align="center" sx={{ py: 5 }}>
              {transactions.length > 0 
                ? 'Nessuna transazione corrisponde ai filtri selezionati.'
                : 'Non ci sono transazioni da visualizzare.'}
            </Typography>
          )}
        </>
      )}

      {/* Floating action button for mobile */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={handleAddClick}
      >
        <AddIcon />
      </Fab>

      {/* Edit Dialog */}
      <EditTransactionDialog
        open={isEditDialogOpen}
        onClose={handleEditDialogClose}
        transaction={selectedTransaction}
        categories={categories}
        onSave={handleSaveTransaction}
        loading={actionLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
        title="Elimina transazione"
        content={`Sei sicuro di voler eliminare la transazione "${selectedTransaction?.description}"? Questa azione non può essere annullata.`}
        loading={actionLoading}
      />

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

