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
    FormHelperText,
    Grid,
    CircularProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import itLocale from 'date-fns/locale/it';
import AsyncSelect from 'react-select/async';
import { fetchListingStatus, fetchQuoteOnNearestTradingDate } from '../services/YahooFinanceService';

const EditInvestmentDialog = ({
    open,
    onClose,
    investment,
    onSave,
    loading
}) => {
    const [formData, setFormData] = useState({
        investmentId: 0,
        purchaseDate: new Date(),
        assetName: '',
        quantity: '',
        purchasePrice: '',
        action: 0, // 0 = Buy, 1 = Sell
        currentPrice: '',
        userId: 0
    });

    const [errors, setErrors] = useState({});
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [, setAssetInfo] = useState(null);
    const [unitPrice, setUnitPrice] = useState(0);

    // Quando l'investimento cambia (apertura dialogo con nuovo investimento)
    useEffect(() => {
        if (investment) {
            console.log("Setting form data from investment:", investment);
            setFormData({
                investmentId: investment.investmentId,
                purchaseDate: new Date(investment.purchaseDate),
                assetName: investment.assetName || '',
                quantity: investment.quantity.toString(),
                purchasePrice: Math.abs(investment.purchasePrice).toString(),
                action: investment.action,
                currentPrice: investment.currentPrice ? investment.currentPrice.toString() : '',
                userId: investment.userId || parseInt(localStorage.getItem('userId'))
            });
            setErrors({});
            // Set the default selected asset
            setSelectedAsset({
                label: investment.assetName + ' (...)', // You might format properly
                value: investment.assetName
            });
            setUnitPrice(0);
        }
    }, [investment]);

    // Load asset options
    const loadOptions = async (inputValue) => {
        if (!inputValue) return [];
        try {
            const list = await fetchListingStatus(inputValue);
            return list.map(item => ({
                label: `${item.name} (${item.symbol})`,
                value: item.symbol,
                name: item.name,
                exchange: item.exchange
            }));
        } catch {
            return [];
        }
    };

    // Re-fetch the asset price when asset or date changes
    useEffect(() => {
        if (!selectedAsset || !formData.purchaseDate) return;
        setAssetInfo(null);
        fetchQuoteOnNearestTradingDate(selectedAsset.value, formData.purchaseDate)
            .then(data => {
                const price = data.price || 0;
                setUnitPrice(price);
                // Recompute the total purchase price
                setFormData(prev => ({
                    ...prev,
                    purchasePrice: (parseFloat(prev.quantity) || 0) * price
                }));
                setAssetInfo({ price, ...data });
            })
            .catch(() => setAssetInfo(null));
    }, [selectedAsset, formData.purchaseDate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Reset validation error for this field
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleDateChange = (newDate) => {
        setFormData({ ...formData, purchaseDate: newDate });
        // Reset validation error for date
        if (errors.purchaseDate) {
            setErrors({ ...errors, purchaseDate: '' });
        }
    };

    const handleAssetChange = (option) => {
        setSelectedAsset(option);
        setFormData(prev => ({
            ...prev,
            assetName: option?.value || ''
        }));
    };

    const handleQuantityChange = (e) => {
        const qty = parseFloat(e.target.value) || 0;
        setFormData({
            ...formData,
            quantity: e.target.value,
            purchasePrice: qty * unitPrice
        });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.purchaseDate) {
            newErrors.purchaseDate = 'La data è obbligatoria';
        }
        if (!formData.assetName.trim()) {
            newErrors.assetName = 'Il nome dell\'asset è obbligatorio';
        }
        if (!formData.quantity || isNaN(parseFloat(formData.quantity)) || parseFloat(formData.quantity) <= 0) {
            newErrors.quantity = 'La quantità deve essere un numero maggiore di zero';
        }
        if (!formData.purchasePrice || isNaN(parseFloat(formData.purchasePrice)) || parseFloat(formData.purchasePrice) <= 0) {
            newErrors.purchasePrice = 'Il prezzo di acquisto deve essere un numero maggiore di zero';
        }
        if (formData.currentPrice && (isNaN(parseFloat(formData.currentPrice)) || parseFloat(formData.currentPrice) < 0)) {
            newErrors.currentPrice = 'Il prezzo attuale deve essere un numero maggiore o uguale a zero';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        console.log("Submitting form data:", formData);
        if (validate()) {
            // Use updated purchasePrice from computed
            const totalPrice = parseFloat(formData.quantity) * unitPrice;
            const numericAction = parseInt(formData.action);
            
            // Create the investment object with camelCase properties for frontend use
            const updatedInvestment = {
                investmentId: formData.investmentId,
                quantity: parseFloat(formData.quantity),
                purchasePrice: numericAction === 1 ? -totalPrice : totalPrice,
                currentPrice: formData.currentPrice ? parseFloat(formData.currentPrice) : null,
                purchaseDate: formData.purchaseDate,
                action: numericAction,
                userId: parseInt(formData.userId || localStorage.getItem('userId')),
                assetName: selectedAsset?.value || formData.assetName
            };
            
            // Convert to PascalCase for backend API
            const pascalCaseInvestment = {
                InvestmentId: updatedInvestment.investmentId,
                Quantity: updatedInvestment.quantity,
                PurchasePrice: updatedInvestment.purchasePrice,
                CurrentPrice: updatedInvestment.currentPrice,
                PurchaseDate: updatedInvestment.purchaseDate,
                Action: updatedInvestment.action,
                UserId: updatedInvestment.userId,
                AssetName: updatedInvestment.assetName
            };
            
            console.log("Sending investment data (PascalCase):", pascalCaseInvestment);
            onSave(pascalCaseInvestment);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {investment ? 'Modifica Investimento' : 'Nuovo Investimento'}
            </DialogTitle>
            <DialogContent>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={itLocale}>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <DatePicker
                                label="Data di Acquisto"
                                value={formData.purchaseDate}
                                onChange={handleDateChange}
                                format="dd/MM/yyyy"
                                slotProps={{
                                    textField: {
                                      fullWidth: true,
                                      error: !!errors.purchaseDate,
                                      helperText: errors.purchaseDate
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                value={selectedAsset}
                                loadOptions={loadOptions}
                                onChange={handleAssetChange}
                                placeholder="Cerca e seleziona un asset..."
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Quantità"
                                name="quantity"
                                type="number"
                                value={formData.quantity}
                                onChange={handleQuantityChange}
                                error={!!errors.quantity}
                                helperText={errors.quantity}
                                inputProps={{ step: "0.01" }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Prezzo di Acquisto"
                                name="purchasePrice"
                                type="number"
                                value={formData.purchasePrice}
                                disabled
                                error={!!errors.purchasePrice}
                                helperText={errors.purchasePrice}
                                inputProps={{ step: "0.01" }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth error={!!errors.action}>
                                <InputLabel>Tipo</InputLabel>
                                <Select
                                    name="action"
                                    value={formData.action}
                                    label="Tipo"
                                    onChange={handleChange}
                                >
                                    <MenuItem value={0}>Acquisto</MenuItem>
                                    <MenuItem value={1}>Vendita</MenuItem>
                                </Select>
                                {errors.action && <FormHelperText>{errors.action}</FormHelperText>}
                            </FormControl>
                        </Grid>
                    </Grid>
                </LocalizationProvider>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Annulla</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Salva'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditInvestmentDialog;

