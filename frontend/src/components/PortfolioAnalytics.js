import React, { useState, useEffect } from 'react';
import { fetchRealTimePrice } from '../services/FinnhubService';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Grid,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  LinearProgress,
  IconButton,
  Button,
  Snackbar,
  Alert,
  Tooltip,
  CircularProgress,
  TextField,
  InputAdornment,
  Paper,
  Divider,
  Chip,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  DateRange as DateRangeIcon,
  FilterList as FilterListIcon,
  MonetizationOn as MonetizationOnIcon
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EditInvestmentDialog from './EditInvestmentDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { addTransaction } from '../services/transactionService';


const PortfolioAnalytics = ({ data = [], onEdit, onDelete }) => {
  const theme = useTheme();
  const [investments, setInvestments] = useState([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [totalCurrentValue, setTotalCurrentValue] = useState(0);
  const [totalGainLoss, setTotalGainLoss] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [filteredInvestments, setFilteredInvestments] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const processInvestments = async (investmentsData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!investmentsData || investmentsData.length === 0) {
        const userId = localStorage.getItem('userId');
        const response = await fetch('https://backproject.azurewebsites.net/api/investments', {
          headers: {
            userId
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch investments: ${response.status}`);
        }
        
        investmentsData = await response.json();
      }

      let invested = 0;
      let currentValue = 0;

      for (const inv of investmentsData) {
        let priceNow;
        try {
          console.log('Fetching quote for:', inv.assetName);
          const quote = await fetchRealTimePrice(inv.assetName);
          priceNow = quote?.price || inv.currentPrice || inv.purchasePrice;
        } catch (error) {
          console.error('Error fetching quote:', error);
          priceNow = inv.currentPrice || inv.purchasePrice;
        }

        const purchaseValue = Math.abs(inv.purchasePrice);
        const costoAcquisto = purchaseValue / inv.quantity;
        const totaleOdierno = inv.quantity * priceNow;

        inv.currentPrice = priceNow;
        inv.purchaseValue = costoAcquisto;
        inv.currentTotalValue = totaleOdierno;
        inv.gainLoss = totaleOdierno - costoAcquisto * inv.quantity;
        inv.gainLossPercentage = costoAcquisto > 0
          ? (inv.gainLoss / (costoAcquisto * inv.quantity)) * 100
          : 0;
        inv.oldStockValue = costoAcquisto;

        invested += costoAcquisto * inv.quantity;
        currentValue += totaleOdierno;
      }

      setInvestments(investmentsData);
      setTotalInvested(invested);
      setTotalCurrentValue(currentValue);
      setTotalGainLoss(currentValue - invested);
    } catch (error) {
      console.error('Error processing investments:', error);
      setError('Errore nel caricamento degli investimenti. Assicurati di essere loggato.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    processInvestments(data);
  }, [data]);

  useEffect(() => {
    const filtered = investments.filter(inv => {
      const nameMatch =
        !searchQuery ||
        inv.assetName?.toLowerCase().includes(searchQuery.toLowerCase());
      const purchaseDate = new Date(inv.purchaseDate);
      const inRangeStart = !filterStartDate || purchaseDate >= filterStartDate;
      const inRangeEnd = !filterEndDate || purchaseDate <= filterEndDate;
      const priceOk = () => {
        if (!minPrice && !maxPrice) return true;
        const p = inv.currentPrice || 0;
        const aboveMin = !minPrice || p >= parseFloat(minPrice);
        const belowMax = !maxPrice || p <= parseFloat(maxPrice);
        return aboveMin && belowMax;
      };
      return nameMatch && inRangeStart && inRangeEnd && priceOk();
    });
    setFilteredInvestments(filtered);
  }, [investments, searchQuery, filterStartDate, filterEndDate, minPrice, maxPrice]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setSnackbar({
      open: true,
      message: 'Aggiornamento dati in corso...',
      severity: 'info'
    });
    
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('https://backproject.azurewebsites.net/api/investments', {
        headers: {
          userId
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch investments: ${response.status}`);
      }
      
      const freshData = await response.json();
      await processInvestments(freshData);
      
      setSnackbar({
        open: true,
        message: 'Dati aggiornati con successo',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      setSnackbar({
        open: true,
        message: `Errore nell'aggiornamento: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterStartDate(null);
    setFilterEndDate(null);
    setMinPrice('');
    setMaxPrice('');
  };

  const handleEditClick = (investment) => {
    console.log("Opening edit dialog for investment:", investment);
    setSelectedInvestment(investment);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (investment) => {
    console.log("Opening delete dialog for investment:", investment);
    setSelectedInvestment(investment);
    setDeleteDialogOpen(true);
  };

  const handleSellClick = (investment) => {
    console.log("Opening sell dialog for investment:", investment);
    setSelectedInvestment(investment);
    setSellDialogOpen(true);
  };

  const handleUpdateInvestment = async (updatedInvestment) => {
    console.log("Updating investment:", updatedInvestment);
    setOperationLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      
      if (updatedInvestment.PurchaseDate instanceof Date) {
        updatedInvestment.PurchaseDate = updatedInvestment.PurchaseDate.toISOString();
      }
      
      const response = await fetch(`https://backproject.azurewebsites.net/api/investments/${updatedInvestment.InvestmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'userId': userId
        },
        body: JSON.stringify(updatedInvestment)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error updating investment:", errorText);
        throw new Error(`Failed to update investment: ${errorText || response.statusText}`);
      }

      const responseData = await response.json();

      const camelCaseResponse = {
        investmentId: responseData.InvestmentId || responseData.investmentId,
        purchaseDate: responseData.PurchaseDate || responseData.purchaseDate,
        assetName: responseData.AssetName || responseData.assetName,
        quantity: responseData.Quantity || responseData.quantity,
        purchasePrice: responseData.PurchasePrice || responseData.purchasePrice,
        currentPrice: responseData.CurrentPrice || responseData.currentPrice,
        action: responseData.Action || responseData.action,
        userId: responseData.UserId || responseData.userId
      };

      setInvestments(prev => 
        prev.map(inv => 
          inv.investmentId === camelCaseResponse.investmentId ? {
            ...inv,
            ...camelCaseResponse
          } : inv
        )
      );

      setEditDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Investimento aggiornato con successo',
        severity: 'success'
      });
      
      if (onEdit) {
        onEdit(camelCaseResponse);
      }
    } catch (error) {
      console.error("Failed to update investment:", error);
      setSnackbar({
        open: true,
        message: `Errore nell'aggiornamento: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteInvestment = async () => {
    if (!selectedInvestment) {
      console.warn("No investment selected for deletion");
      return;
    }
    
    console.log("Deleting investment:", selectedInvestment);
    setOperationLoading(true);
    
    try {
      const userId = localStorage.getItem('userId');
      
      const response = await fetch(`https://backproject.azurewebsites.net/api/investments/${selectedInvestment.investmentId}`, {
        method: 'DELETE',
        headers: {
          'userId': userId
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error deleting investment:", errorText);
        throw new Error(`Failed to delete investment: ${errorText || response.statusText}`);
      }
      
      setInvestments(prev => prev.filter(inv => inv.investmentId !== selectedInvestment.investmentId));
      
      setDeleteDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Investimento eliminato con successo',
        severity: 'success'
      });
      
      if (onDelete) {
        onDelete(selectedInvestment);
      }
    } catch (error) {
      console.error("Failed to delete investment:", error);
      setSnackbar({
        open: true,
        message: `Errore nell'eliminazione: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleSellInvestment = async () => {
    if (!selectedInvestment) {
      console.warn("No investment selected for selling");
      return;
    }
    
    console.log("Selling investment:", selectedInvestment);
    setOperationLoading(true);
    
    try {
      const userId = localStorage.getItem('userId');
      
      const deleteResponse = await fetch(`https://backproject.azurewebsites.net/api/investments/${selectedInvestment.investmentId}`, {
        method: 'DELETE',
        headers: {
          'userId': userId
        }
      });
      
      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text();
        console.error("Error deleting investment:", errorText);
        throw new Error(`Failed to delete investment: ${errorText || deleteResponse.statusText}`);
      }
      
      const currentTotalValue = selectedInvestment.currentPrice * selectedInvestment.quantity;
      
      let categoryId = null;
      
      const categoriesResponse = await fetch('https://backproject.azurewebsites.net/api/categories', {
        headers: { 'userId': userId }
      });
      
      if (categoriesResponse.ok) {
        const categories = await categoriesResponse.json();
        const investmentCategory = categories.find(cat => 
          cat.name.toLowerCase() === "investimenti" || 
          cat.name.toLowerCase() === "investimento"
        );
        
        if (investmentCategory) {
          categoryId = investmentCategory.categoryId;
        } else {
          const createCategoryResponse = await fetch('https://backproject.azurewebsites.net/api/categories', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'userId': userId
            },
            body: JSON.stringify({
              name: "Investimenti",
              userId: parseInt(userId)
            })
          });
          
          if (createCategoryResponse.ok) {
            const newCategory = await createCategoryResponse.json();
            categoryId = newCategory.categoryId;
          }
        }
      }
      
      const transactionData = {
        description: `Vendita ${selectedInvestment.quantity} ${selectedInvestment.assetName}`,
        amount: currentTotalValue,
        date: new Date().toISOString(),
        categoryId: categoryId,
        userId: parseInt(userId),
        type: 0
      };
      
      await addTransaction(transactionData);
      
      setInvestments(prev => prev.filter(inv => inv.investmentId !== selectedInvestment.investmentId));
      
      setSellDialogOpen(false);
      setSnackbar({
        open: true,
        message: `Investimento venduto con successo per €${currentTotalValue.toFixed(2)}`,
        severity: 'success'
      });
      
    } catch (error) {
      console.error("Failed to sell investment:", error);
      setSnackbar({
        open: true,
        message: `Errore nella vendita: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setOperationLoading(false);
    }
  };

  return (
    <Box sx={{
      maxWidth: 1200,
      mx: 'auto',
      py: 4,
      px: { xs: 1, md: 3 },
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default
    }}>
      {loading ? (
        <LinearProgress />
      ) : error ? (
        <Box sx={{ textAlign: 'center', my: 4, p: 3, bgcolor: 'error.light', borderRadius: 2 }}>
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Capitale 
            </Typography>
            <Tooltip title="Aggiorna dati investimenti">
              <IconButton 
                onClick={handleRefresh} 
                disabled={refreshing}
                color="primary"
                sx={{ 
                  backgroundColor: theme.palette.primary.light + '20',
                  '&:hover': { backgroundColor: theme.palette.primary.light + '40' }
                }}
              >
                {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
          </Box>

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
          <Collapse in={showFilters}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Cerca per nome asset..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setSearchQuery('')}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{ mb: 2 }}
                />
              </Box>

              <Divider sx={{ mb: 2 }}>
                <Chip label="Filtra per data di acquisto" icon={<DateRangeIcon />} />
              </Divider>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Data iniziale"
                    value={filterStartDate}
                    onChange={setFilterStartDate}
                    renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  />
                  <DatePicker
                    label="Data finale"
                    value={filterEndDate}
                    onChange={setFilterEndDate}
                    renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  />
                </LocalizationProvider>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Prezzo Minimo"
                  size="small"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Prezzo Massimo"
                  size="small"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  fullWidth
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleResetFilters}
                  sx={{ mr: 1 }}
                >
                  Reset filters
                </Button>
              </Box>
            </Paper>
          </Collapse>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ borderLeft: '4px solid #4caf50' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <ArrowUpwardIcon sx={{ color: '#4caf50', mr: 1 }} />
                     Attuale
                  </Typography>
                  <Typography variant="h4">
                    €{totalCurrentValue.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ borderLeft: '4px solid #f44336' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <ArrowDownwardIcon sx={{ color: '#f44336', mr: 1 }} />
                     Investito
                  </Typography>
                  <Typography variant="h4">
                    €{totalInvested.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ borderLeft: '4px solid #2196f3' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Guadagno/Perdita
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ color: totalGainLoss >= 0 ? '#4caf50' : '#f44336' }}
                  >
                    {totalGainLoss >= 0 ? '+' : ''}
                    €{totalGainLoss.toFixed(2)} (
                    {totalInvested
                      ? ((totalGainLoss / totalInvested) * 100).toFixed(2)
                      : '0.00'}
                    %)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{
            borderRadius: '16px',
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[4]
          }}>
            <CardHeader
              title={
                <Typography variant="h5" sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 600
                }}>
                  I tuoi investimenti
                </Typography>
              }
              action={
                <Tooltip title="Aggiorna dati investimenti">
                  <IconButton 
                    onClick={handleRefresh} 
                    disabled={refreshing}
                    color="primary"
                  >
                    {refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent>
              {filteredInvestments.length > 0 ? (
                <Table sx={{ minWidth: 650 }} aria-label="tabella investimenti">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Nome Asset</strong></TableCell>
                      <TableCell><strong>Quantità</strong></TableCell>
                      <TableCell><strong>Prezzo Acquisto</strong></TableCell>
                      <TableCell><strong>Valore Attuale</strong></TableCell>
                      <TableCell><strong>Valore di acquisto</strong></TableCell>
                      <TableCell><strong>Data Acquisto</strong></TableCell>
                      <TableCell align="right"><strong>Totale Attuale</strong></TableCell>
                      <TableCell align="right"><strong>Guadagno/Perdita</strong></TableCell>
                      <TableCell align="center"><strong></strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInvestments.map((investment) => (
                      <TableRow key={investment.investmentId}>
                        <TableCell>{investment.assetName}</TableCell>
                        <TableCell>{investment.quantity}</TableCell>
                        <TableCell>€{investment.purchasePrice.toFixed(2)}</TableCell>
                        <TableCell>€{investment.currentPrice.toFixed(2)}</TableCell>
                        <TableCell>€{investment.oldStockValue.toFixed(2)}</TableCell>
                        <TableCell>{new Date(investment.purchaseDate).toLocaleDateString()}</TableCell>
                        <TableCell align="right">€{investment.currentTotalValue ? investment.currentTotalValue.toFixed(2) : 'N/A'}</TableCell>
                        <TableCell align="right">
                          <span
                            style={{
                              color: investment.gainLoss >= 0 ? '#4caf50' : '#f44336',
                              fontWeight: 500
                            }}
                          >
                            {investment.gainLoss >= 0 ? '+' : '-'}€
                            {Math.abs(investment.gainLoss || 0).toFixed(2)}
                            {' ('}
                            {investment.gainLoss >= 0 ? '+' : ''}
                            {(investment.gainLossPercentage || 0).toFixed(2)}%)
                          </span>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleEditClick(investment)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteClick(investment)}
                          >
                            <DeleteIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleSellClick(investment)}
                            title="Vendi investimento"
                          >
                            <MonetizationOnIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" gutterBottom>
                    Nessun risultato per i filtri attuali.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          <EditInvestmentDialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            investment={selectedInvestment}
            onSave={handleUpdateInvestment}
            loading={operationLoading}
          />

          <DeleteConfirmDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={handleDeleteInvestment}
            title="Conferma eliminazione"
            content={`Sei sicuro di voler eliminare l'investimento in ${selectedInvestment?.assetName || 'questo asset'}? Questa azione non può essere annullata.`}
            loading={operationLoading}
          />
          
          {/* Replace all existing sell dialogs with this single one */}
          <Dialog
            open={sellDialogOpen}
            onClose={() => setSellDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Conferma vendita investimento</DialogTitle>
            <DialogContent>
              <Typography paragraph>
                Stai per vendere {selectedInvestment?.quantity} {selectedInvestment?.assetName} al prezzo corrente di €{selectedInvestment?.currentPrice?.toFixed(2)}.
              </Typography>
              <Typography paragraph>
                <strong>Valore totale della vendita:</strong> €{selectedInvestment ? (selectedInvestment.currentPrice * selectedInvestment.quantity).toFixed(2) : '0.00'}
              </Typography>
              <Typography>
                Questa azione registrerà la vendita come una transazione in entrata nella categoria "Investimenti" e rimuoverà l'investimento dal tuo portfolio.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setSellDialogOpen(false)}
                color="inherit"
                disabled={operationLoading}
              >
                Annulla
              </Button>
              <Button
                onClick={handleSellInvestment}
                color="success"
                variant="contained"
                startIcon={<MonetizationOnIcon />}
                disabled={operationLoading}
              >
                {operationLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Conferma Vendita"
                )}
              </Button>
            </DialogActions>
          </Dialog>
                    {/* Snackbar per notifiche */}
                    <Snackbar
                      open={snackbar.open}
                      autoHideDuration={6000}
                      onClose={handleSnackbarClose}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    >
                      <Alert
                        onClose={handleSnackbarClose}
                        severity={snackbar.severity}
                        variant="filled"
                        sx={{ width: '100%' }}
                      >
                        {snackbar.message}
                      </Alert>
                    </Snackbar>
                  </>
                )}
              </Box>
            );
          };
          
          export default PortfolioAnalytics;