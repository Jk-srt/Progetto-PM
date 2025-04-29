import React, { useState, useEffect } from "react";
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
  Button,
  Snackbar,
  Alert,
  Fab,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { getTransactions, updateTransaction, deleteTransaction } from "../services/transactionService";
import EditTransactionDialog from "../components/EditTransactionDialog";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import AddTransactionPage from "./AddTransactionPage"; // percorso corretto nel folder pages

export default function TransactionsPage({ transactions: propTransactions = [], categories = [], onTransactionsChange }) {
  const [transactions, setTransactions] = useState(propTransactions);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [openAddTx, setOpenAddTx] = useState(false); // stato per il dialog nuova transazione
  const navigate = useNavigate();

  // Se le transazioni vengono passate come prop, usa quelle
  useEffect(() => {
    if (propTransactions.length > 0) {
      setTransactions(propTransactions);
    } else {
      // Altrimenti, carica le transazioni dal server
      loadTransactions();
    }
  }, [propTransactions]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      showSnackbar(`Errore nel caricamento delle transazioni: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calcola totali
  const totalEntrate = transactions
      ?.filter(t => t.amount > 0)
      ?.reduce((sum, t) => sum + t.amount, 0) || 0;

  const totalUscite = transactions
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
      
      // Aggiorna lo stato locale delle transazioni
      setTransactions(transactions.map(t => 
        t.transactionId === savedTransaction.transactionId ? savedTransaction : t
      ));
      
      // Chiudi il dialogo
      handleEditDialogClose();
      
      // Mostra messaggio di successo
      showSnackbar('Transazione aggiornata con successo');
      
      // Notifica il componente padre se necessario
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
      
      // Aggiorna lo stato locale delle transazioni
      setTransactions(transactions.filter(t => t.transactionId !== selectedTransaction.transactionId));
      
      // Chiudi il dialogo
      handleDeleteDialogClose();
      
      // Mostra messaggio di successo
      showSnackbar('Transazione eliminata con successo');
      
      // Notifica il componente padre se necessario
      if (onTransactionsChange) {
        onTransactionsChange();
      }
    } catch (error) {
      showSnackbar(`Errore nell'eliminazione: ${error.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Container>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Typography variant="h4" gutterBottom>
          Storico Transazioni
        </Typography>
        
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
                loadTransactions(); // ricarica dati dopo aggiunta
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards riepilogo */}
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

      {/* Tabella transazioni */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <CircularProgress />
        </div>
      ) : (
        <>
          {transactions.length > 0 ? (
            <Table sx={{ minWidth: 650 }} aria-label="tabella transazioni">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Data</strong></TableCell>
                  <TableCell><strong>Descrizione</strong></TableCell>
                  <TableCell><strong>Categoria</strong></TableCell>
                  <TableCell><strong>Metodo</strong></TableCell>
                  <TableCell align="right"><strong>Importo</strong></TableCell>
                  <TableCell align="center"><strong>Azioni</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.transactionId}>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.category?.name || 'N/A'}</TableCell>
                    <TableCell>{transaction.method || 'N/A'}</TableCell>
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
              Non ci sono transazioni da visualizzare.
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
