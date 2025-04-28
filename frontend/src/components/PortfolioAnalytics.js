import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import { fetchListingStatus } from '../services/YahooFinanceService';
import CombinedInvestmentChart from './CombinedInvestmentChart';
import InvestmentService from '../services/InvestmentService';
import {
    Card,
    CardHeader,
    CardContent,
    Typography,
    Box,
    Grid,
    Paper,
    useTheme,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    LinearProgress,
    IconButton,
    Button
} from '@mui/material';
import {
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon
} from '@mui/icons-material';

const PortfolioAnalytics = () => {
    const theme = useTheme();
    const [investments, setInvestments] = useState([]);
    const [totalInvested, setTotalInvested] = useState(0);
    const [totalCurrentValue, setTotalCurrentValue] = useState(0);
    const [totalGainLoss, setTotalGainLoss] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState(null);
    const [error, setError] = useState(null);

    // Fetch user investments from the database
    useEffect(() => {
        const fetchInvestments = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await InvestmentService.getAll();
                const investmentsData = response.data || [];
                
                // Calculate investment metrics
                let invested = 0;
                let currentValue = 0;
                
                investmentsData.forEach(inv => {
                    const purchaseValue = inv.quantity * inv.purchasePrice;
                    const currentValueCalc = inv.quantity * (inv.currentPrice || inv.purchasePrice);
                    
                    invested += purchaseValue;
                    currentValue += currentValueCalc;
                    
                    // Add calculated values to each investment for display
                    inv.purchaseValue = purchaseValue;
                    inv.currentTotalValue = currentValueCalc;
                    inv.gainLoss = currentValueCalc - purchaseValue;
                    inv.gainLossPercentage = purchaseValue > 0 ? (inv.gainLoss / purchaseValue) * 100 : 0;
                });
                
                setInvestments(investmentsData);
                setTotalInvested(invested);
                setTotalCurrentValue(currentValue);
                setTotalGainLoss(currentValue - invested);
            } catch (error) {
                console.error('Error fetching investments:', error);
                setError('Errore nel caricamento degli investimenti. Assicurati di essere loggato.');
            } finally {
                setLoading(false);
            }
        };

        fetchInvestments();
    }, []);

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
                    {/* Summary Cards */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ borderLeft: '4px solid #4caf50' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <ArrowUpwardIcon sx={{ color: '#4caf50', mr: 1 }} />
                                        Valore Attuale
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
                                        Capitale Investito
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
                                        {totalInvested ? ((totalGainLoss / totalInvested) * 100).toFixed(2) : '0.00'}%)
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    

                    {/* Investments Table */}
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
                        />
                        <CardContent>
                            {investments.length > 0 ? (
                                <Table sx={{ minWidth: 650 }} aria-label="tabella investimenti">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Nome Asset</strong></TableCell>
                                            <TableCell><strong>Quantità</strong></TableCell>
                                            <TableCell><strong>Prezzo Acquisto</strong></TableCell>
                                            <TableCell><strong>Prezzo Attuale</strong></TableCell>
                                            <TableCell><strong>Data Acquisto</strong></TableCell>
                                            <TableCell align="right"><strong>Valore Totale</strong></TableCell>
                                            <TableCell align="right"><strong>Guadagno/Perdita</strong></TableCell>
                                            <TableCell align="center"><strong>Azioni</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {investments.map((investment, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{investment.assetName}</TableCell>
                                                <TableCell>{investment.quantity}</TableCell>
                                                <TableCell>€{investment.purchasePrice.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    {investment.currentPrice
                                                        ? `€${investment.currentPrice.toFixed(2)}`
                                                        : `€${investment.purchasePrice.toFixed(2)}`}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(investment.purchaseDate).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell align="right">
                                                    €{investment.currentTotalValue.toFixed(2)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <span
                                                        style={{
                                                            color: investment.gainLoss >= 0 ? '#4caf50' : '#f44336',
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {investment.gainLoss >= 0 ? '+' : '-'}€
                                                        {Math.abs(investment.gainLoss).toFixed(2)}
                                                        {' ('}
                                                        {investment.gainLoss >= 0 ? '+' : ''}
                                                        {investment.gainLossPercentage.toFixed(2)}%)
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
                </>
            )}
        </Box>
    );
};

export default PortfolioAnalytics;
