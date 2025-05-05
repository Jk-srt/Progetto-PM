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
  CircularProgress
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import EditInvestmentDialog from './EditInvestmentDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';

const PortfolioAnalytics = ({ data = [], onEdit, onDelete }) => {
  const theme = useTheme();
  const [investments, setInvestments] = useState([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [totalCurrentValue, setTotalCurrentValue] = useState(0);
  const [totalGainLoss, setTotalGainLoss] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stati per le operazioni di modifica ed eliminazione
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

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

        // Correct calculation of purchase value and current value
        const purchaseValue = Math.abs(inv.purchasePrice);
        const costoAcquisto = purchaseValue / inv.quantity;
        const totaleOdierno = inv.quantity * priceNow;

        // Assign corrected properties
        inv.currentPrice = priceNow;
        inv.purchaseValue = costoAcquisto;
        inv.currentTotalValue = totaleOdierno;
        inv.gainLoss = totaleOdierno - costoAcquisto * inv.quantity;
        inv.gainLossPercentage = costoAcquisto > 0
          ? (inv.gainLoss / (costoAcquisto * inv.quantity)) * 100
          : 0;
        inv.oldStockValue = costoAcquisto; // Aggiunto vecchio valore dello stock

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

  // Funzione per aprire il dialog di modifica
  const handleEditClick = (investment) => {
    console.log("Opening edit dialog for investment:", investment);
    setSelectedInvestment(investment);
    setEditDialogOpen(true);
  };

  // Funzione per aprire il dialog di eliminazione
  const handleDeleteClick = (investment) => {
    console.log("Opening delete dialog for investment:", investment);
    setSelectedInvestment(investment);
    setDeleteDialogOpen(true);
  };

  // Funzione per aggiornare un investimento
  const handleUpdateInvestment = async (updatedInvestment) => {
    console.log("Updating investment:", updatedInvestment);
    setOperationLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      
      console.log("Sending PUT request to API:", `https://backproject.azurewebsites.net/api/investments/${updatedInvestment.InvestmentId}`);
      
      // Ensure the purchaseDate is properly formatted if it's a Date object
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

      console.log("API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error updating investment:", errorText);
        throw new Error(`Failed to update investment: ${errorText || response.statusText}`);
      }

      const responseData = await response.json();
      console.log("Updated investment data:", responseData);

      // Convert responseData from PascalCase to camelCase for frontend use
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

      // Update local state with the updated investment data
      setInvestments(prev => 
        prev.map(inv => 
          inv.investmentId === camelCaseResponse.investmentId ? {
            ...inv,
            ...camelCaseResponse
          } : inv
        )
      );

      // Close dialog and show success message
      setEditDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Investimento aggiornato con successo',
        severity: 'success'
      });
      
      // Notify parent component if necessary
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

  // Funzione di eliminazione
  const handleDeleteInvestment = async () => {
    if (!selectedInvestment) {
      console.warn("No investment selected for deletion");
      return;
    }
    
    console.log("Deleting investment:", selectedInvestment);
    setOperationLoading(true);
    
    try {
      const userId = localStorage.getItem('userId');
      
      console.log("Sending DELETE request to API:", `https://backproject.azurewebsites.net/api/investments/${selectedInvestment.investmentId}`);
      
      const response = await fetch(`https://backproject.azurewebsites.net/api/investments/${selectedInvestment.investmentId}`, {
        method: 'DELETE',
        headers: {
          'userId': userId
        }
      });
      
      console.log("API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error deleting investment:", errorText);
        throw new Error(`Failed to delete investment: ${errorText || response.statusText}`);
      }
      
      // Update local state by removing the deleted investment
      setInvestments(prev => prev.filter(inv => inv.investmentId !== selectedInvestment.investmentId));
      
      // Close dialog and show success message
      setDeleteDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Investimento eliminato con successo',
        severity: 'success'
      });
      
      // Notify parent component if necessary
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
          
          {/* Summary Cards */}
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
              {investments.length > 0 ? (
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
                    {investments.map((investment) => (
                      <TableRow key={investment.investmentId}>
                        <TableCell>{investment.assetName}</TableCell>
                        <TableCell>{investment.quantity}</TableCell>
                        <TableCell>€{investment.purchasePrice.toFixed(2)}</TableCell>
                        <TableCell>€{investment.currentPrice.toFixed(2)}</TableCell>
                        <TableCell>€{investment.oldStockValue.toFixed(2)}</TableCell> {/* Nuova cella */}
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" gutterBottom>
                    Non hai ancora aggiunto investimenti al tuo portafoglio.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    href="/add-investment"
                  >
                    Aggiungi il tuo primo investimento
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Edit Investment Dialog */}
          <EditInvestmentDialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            investment={selectedInvestment}
            onSave={handleUpdateInvestment}
            loading={operationLoading}
          />

          {/* Delete Confirm Dialog */}
          <DeleteConfirmDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={handleDeleteInvestment}
            title="Conferma eliminazione"
            content={`Sei sicuro di voler eliminare l'investimento in ${selectedInvestment?.assetName || 'questo asset'}? Questa azione non può essere annullata.`}
            loading={operationLoading}
          />
          
          {/* Snackbar notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert 
              onClose={handleSnackbarClose} 
              severity={snackbar.severity} 
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
