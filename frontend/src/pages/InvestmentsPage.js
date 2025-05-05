import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Button,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Wallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  Savings as SavingsIcon,
  PieChart as PieChartIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Line, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import InvestmentService from '../services/InvestmentService';
import EditInvestmentDialog from '../components/EditInvestmentDialog';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';

const InvestmentsPage = () => {
  const [investments, setInvestments] = useState([]);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolioChange, setPortfolioChange] = useState(0);
  const [loading, setLoading] = useState(true);

  // Stati per le operazioni di modifica ed eliminazione
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);

  // Funzione per caricare gli investimenti
  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const data = await InvestmentService.getAll();
      setInvestments(data);
      const totalValue = data.data.reduce((sum, inv) => sum + inv.value, 0);
      setPortfolioValue(totalValue);
      setPortfolioChange((totalValue - 24000) / 24000 * 100); // Example baseline
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);
  
  

  // Funzione per aprire il dialog di modifica
  const handleEditClick = (investment) => {
    setSelectedInvestment(investment);
    setEditDialogOpen(true);
  };

  // Funzione per aprire il dialog di eliminazione
  const handleDeleteClick = (investment) => {
    setSelectedInvestment(investment);
    setDeleteDialogOpen(true);
  };

  // Funzione per aggiornare un investimento
  const handleUpdateInvestment = async (updatedInvestment) => {
    console.log("[DEBUG] Avvio aggiornamento investimento:", updatedInvestment);
    setOperationLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      console.log("[DEBUG] UserID:", userId, "InvestmentID:", updatedInvestment.investmentId);

      const response = await fetch(`https://backproject.azurewebsites.net/api/investments/${updatedInvestment.investmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'userId': userId
        },
        body: JSON.stringify(updatedInvestment)
      });

      console.log("[DEBUG] Risposta API - Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[ERROR] Errore aggiornamento:", errorText);
        throw new Error(`Failed to update investment: ${errorText}`);
      }

      const responseData = await response.json();
      console.log("[DEBUG] Dati aggiornati ricevuti:", responseData);

      // Aggiornamento ottimizzato dello stato
      setInvestments(prev => {
        const newInvestments = prev.map(inv =>
            inv.investmentId === responseData.investmentId ? responseData : inv
        );
        console.log("[DEBUG] Nuovo stato investimenti:", newInvestments);
        return newInvestments;
      });

      setEditDialogOpen(false);
      console.log("[DEBUG] Aggiornamento completato con successo");

    } catch (error) {
      console.error("[ERROR] Errore durante l'aggiornamento:", error);
      alert(`Errore nell'aggiornamento: ${error.message}`);
    } finally {
      setOperationLoading(false);
    }
  };

// InvestmentsPage.js - Funzione di eliminazione
  const handleDeleteInvestment = async () => {
    if (!selectedInvestment) {
      console.warn("[WARN] Nessun investimento selezionato per l'eliminazione");
      return;
    }

    console.log("[DEBUG] Avvio eliminazione investimento:", selectedInvestment);
    setOperationLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      console.log("[DEBUG] UserID:", userId, "InvestmentID:", selectedInvestment.investmentId);

      const response = await fetch(`https://backproject.azurewebsites.net/api/investments/${selectedInvestment.investmentId}`, {
        method: 'DELETE',
        headers: {'userId': userId}
      });

      console.log("[DEBUG] Risposta API - Status:", response.status);

      if (response.status === 404) {
        console.warn("[WARN] Investimento non trovato");
        throw new Error('Investimento non trovato');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[ERROR] Errore eliminazione:", errorText);
        throw new Error(`Failed to delete investment: ${errorText}`);
      }

      // Aggiornamento ottimizzato dello stato
      setInvestments(prev => {
        const newInvestments = prev.filter(inv =>
            inv.investmentId !== selectedInvestment.investmentId
        );
        console.log("[DEBUG] Nuovo stato investimenti:", newInvestments);
        return newInvestments;
      });

      setDeleteDialogOpen(false);
      console.log("[DEBUG] Eliminazione completata con successo");

    } catch (error) {
      console.error("[ERROR] Errore durante l'eliminazione:", error);
      alert(`Errore nell'eliminazione: ${error.message}`);
    } finally {
      setOperationLoading(false);
    }
  };


  return (
    <Box sx={{ p: 3 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <LinearProgress />
        </Box>
      ) : (
        <>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold">
              Dashboard Investimenti
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Benvenuto! Ecco l'andamento dei tuoi investimenti.
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Valore Portafoglio
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        €{portfolioValue.toLocaleString()}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={portfolioChange >= 0 ? 'success.main' : 'error.main'}
                      >
                        {portfolioChange >= 0 ? '+' : ''}
                        {portfolioChange.toFixed(2)}% (oggi)
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <WalletIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            {/* Add more cards as needed */}
          </Grid>

          {/* Charts */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Andamento Portafoglio
                  </Typography>
                  <Line data={portfolioPerformanceData} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Allocazione Asset
                  </Typography>
                  <Doughnut data={assetAllocationData} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

              {/* Investments List */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    I tuoi investimenti
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Asset</TableCell>
                          <TableCell>Quantità</TableCell>
                          <TableCell>Prezzo Acquisto</TableCell>
                          <TableCell>Prezzo Attuale</TableCell>
                          <TableCell>Valore</TableCell>
                          <TableCell>Variazione</TableCell>
                          <TableCell>Azioni</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {investments.map((investment, index) => (
                            <TableRow key={index}>
                              <TableCell>{investment.assetName}</TableCell>
                              <TableCell>{investment.quantity} unità</TableCell>
                              <TableCell>€{Math.abs(investment.purchasePrice).toLocaleString()}</TableCell>
                              <TableCell>€{investment.currentPrice?.toLocaleString() || 'N/A'}</TableCell>
                              <TableCell>€{investment.value?.toLocaleString()}</TableCell>
                              <TableCell>
                                <Typography
                                    color={investment.change >= 0 ? 'success.main' : 'error.main'}
                                >
                                  {investment.change >= 0 ? '+' : ''}
                                  {investment.change?.toFixed(2)}%
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleEditClick(investment)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteClick(investment)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
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
            </>
        )}
      </Box>
  );
};

export default InvestmentsPage;
