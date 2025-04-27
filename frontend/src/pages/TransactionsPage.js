import React from "react";
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
  IconButton
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

export default function TransactionsPage({ transactions = [] }) {
  // Calcola totali
  const totalEntrate = transactions
      ?.filter(t => t.amount > 0)
      ?.reduce((sum, t) => sum + t.amount, 0) || 0;

  const totalUscite = transactions
      ?.filter(t => t.amount < 0)
      ?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

  const saldoNetto = totalEntrate - totalUscite;

  return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <Typography variant="h4" gutterBottom>
            Storico Transazioni
          </Typography>
          
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
            {transactions.map((transaction, index) => (
                <TableRow key={index}>
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
                    <IconButton size="small" color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </Container>
  );
}
