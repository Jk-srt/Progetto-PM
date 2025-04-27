import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { fetchListingStatus } from '../services/YahooFinanceService';
import CombinedInvestmentChart from './CombinedInvestmentChart';
import {
    Card,
    CardHeader,
    CardContent,
    Typography,
    Box,
    Grid,
    Paper,
    useTheme
} from '@mui/material';

const portfolioInvestments = [
    { id: 'AAPL', name: 'Apple Inc.', type: 'Azione', exchange: 'NASDAQ' },
    { id: 'MSFT', name: 'Microsoft Corporation', type: 'Azione', exchange: 'NASDAQ' },
    { id: 'GOOGL', name: 'Alphabet Inc. (Google)', type: 'Azione', exchange: 'NASDAQ' },
    { id: 'AMZN', name: 'Amazon.com Inc.', type: 'Azione', exchange: 'NASDAQ' },
    { id: 'JPM', name: 'JPMorgan Chase & Co.', type: 'Azione', exchange: 'NYSE' },
    { id: 'NEE', name: 'NextEra Energy Inc.', type: 'Azione', exchange: 'NYSE' },
    { id: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'ETF', exchange: 'NYSEARCA' },
    { id: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'ETF', exchange: 'NYSEARCA' },
    { id: 'QQQ', name: 'Invesco QQQ Trust (Nasdaq-100)', type: 'ETF', exchange: 'NASDAQ' },
    { id: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'ETF', exchange: 'NYSEARCA' },
    { id: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', type: 'ETF', exchange: 'NYSEARCA' }
];

const PortfolioAnalytics = () => {
    const theme = useTheme();

    const [selectedOption, setSelectedOption] = useState({
        value: 'AAPL',
        name: 'Apple Inc.',
        type: 'Azione',
        exchange: 'NASDAQ'
    });

    const loadOptions = async (inputValue) => {
        if (!inputValue) {
            return portfolioInvestments.map(inv => ({
                label: `${inv.name} (${inv.id})`,
                value: inv.id,
                name: inv.name,
                type: inv.type,
                exchange: inv.exchange
            }));
        }
        const list = await fetchListingStatus(inputValue);
        return list.map(item => ({
            label: `${item.name} (${item.symbol})`,
            value: item.symbol,
            name: item.name,
            type: item.type,
            exchange: item.exchange
        }));
    };

    const getInvestmentDetails = (opt) => {
        if (!opt) return [];
        return [
            { label: 'Simbolo', value: opt.value },
            { label: 'Nome', value: opt.name },
            { label: 'Exchange', value: opt.exchange },
            { label: 'Tipo', value: opt.type }
        ];
    };

    const customSelectStyles = {
        control: (base) => ({
            ...base,
            backgroundColor: theme.palette.background.paper,
            borderColor: theme.palette.primary.main,
            borderRadius: '8px',
            minHeight: '48px',
            color: theme.palette.text.primary,
            boxShadow: 'none',
            '&:hover': {
                borderColor: theme.palette.primary.dark
            }
        }),
        input: (base) => ({
            ...base,
            color: theme.palette.text.primary
        }),
        singleValue: (base) => ({
            ...base,
            color: theme.palette.text.primary
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.primary.main}`,
            borderRadius: '8px',
            zIndex: 9999
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? theme.palette.action.hover : 'transparent',
            color: theme.palette.text.primary,
            '&:active': {
                backgroundColor: theme.palette.action.selected
            }
        }),
        placeholder: (base) => ({
            ...base,
            color: theme.palette.text.secondary
        })
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
            {/* Header e ricerca */}
            <Card sx={{
                mb: 4,
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                boxShadow: theme.shadows[6],
                overflow: 'hidden'
            }}>
                <CardContent sx={{ position: 'relative', zIndex: 2 }}>
                    <Typography variant="h3" sx={{
                        color: 'white',
                        mb: 4,
                        fontWeight: 700,
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        textAlign: 'center'
                    }}>
                        Analisi Mercato
                    </Typography>

                    <Grid container spacing={3} justifyContent="center">
                        <Grid item xs={12} md={8}>
                            <Typography variant="subtitle1" sx={{
                                color: 'rgba(255,255,255,0.9)',
                                mb: 2,
                                fontWeight: 500,
                                textAlign: 'center'
                            }}>
                                Cerca e seleziona un investimento per visualizzare i dettagli e le analisi delle prestazioni.
                            </Typography>
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                loadOptions={loadOptions}
                                value={selectedOption}
                                onChange={setSelectedOption}
                                placeholder="Inserisci simbolo o nome..."
                                // aggiunte per portale e z‑index
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: base => ({ ...base, zIndex: 9999 })
                                }}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                theme={selectTheme => ({
                                    ...selectTheme,
                                    borderRadius: 8,
                                    colors: {
                                        ...selectTheme.colors,
                                        primary25: theme.palette.action.hover,
                                        primary: theme.palette.primary.main,
                                        neutral0: theme.palette.background.paper,
                                        neutral80: theme.palette.text.primary
                                    }
                                })}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Dettagli investimento */}
            <Card sx={{
                mb: 4,
                borderRadius: '16px',
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[4]
            }}>
                <CardHeader
                    title={
                        <Typography variant="h5" sx={{
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                            textAlign: 'center'
                        }}>
                            Dettagli Investimento
                        </Typography>
                    }
                />
                <CardContent>
                    <Typography variant="body1" sx={{
                        color: theme.palette.text.secondary,
                        mb: 3,
                        textAlign: 'center'
                    }}>
                        Esplora i dettagli del tuo investimento selezionato, inclusi simbolo, nome, exchange e tipo.
                    </Typography>
                    <Grid container spacing={2} justifyContent="center">
                        {getInvestmentDetails(selectedOption).map((detail, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Paper sx={{
                                    p: 2,
                                    borderRadius: '8px',
                                    border: `1px solid ${theme.palette.divider}`,
                                    backgroundColor: theme.palette.background.default,
                                    textAlign: 'center',
                                    boxShadow: theme.shadows[1],
                                    transition: 'transform 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        boxShadow: theme.shadows[4]
                                    }
                                }}>
                                    <Typography variant="caption" sx={{
                                        color: theme.palette.text.secondary,
                                        fontWeight: 500,
                                        letterSpacing: 1
                                    }}>
                                        {detail.label}
                                    </Typography>
                                    <Typography variant="h6" sx={{
                                        color: theme.palette.text.primary,
                                        fontWeight: 700,
                                        mt: 1
                                    }}>
                                        {detail.value}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>

            {/* Grafico */}
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
                            Analisi Prestazioni
                        </Typography>
                    }
                />
                <CardContent sx={{ pt: 0 }}>
                    <CombinedInvestmentChart
                        symbol={selectedOption.value}
                        investmentName={selectedOption.name}
                    />
                </CardContent>
            </Card>
        </Box>
    );
};

export default PortfolioAnalytics;
