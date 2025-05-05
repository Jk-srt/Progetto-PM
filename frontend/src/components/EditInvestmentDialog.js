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

// Helper function to convert camelCase to PascalCase
const toPascalCase = (obj) => {
    const result = {};
    Object.keys(obj).forEach(key => {
        // Convert first character to uppercase
        const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
        result[pascalKey] = obj[key];
    });
    return result;
};

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
        }
    }, [investment]);

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
            const numericPrice = parseFloat(formData.purchasePrice);
            const numericAction = parseInt(formData.action);
            
            // Create the investment object with camelCase properties for frontend use
            const updatedInvestment = {
                investmentId: formData.investmentId,
                quantity: parseFloat(formData.quantity),
                purchasePrice: numericAction === 1 ? -numericPrice : numericPrice,
                currentPrice: formData.currentPrice ? parseFloat(formData.currentPrice) : null,
                purchaseDate: formData.purchaseDate,
                action: numericAction,
                userId: parseInt(formData.userId || localStorage.getItem('userId')),
                assetName: formData.assetName
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
                            <TextField
                                fullWidth
                                label="Nome Asset"
                                name="assetName"
                                value={formData.assetName}
                                onChange={handleChange}
                                error={!!errors.assetName}
                                helperText={errors.assetName}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Quantità"
                                name="quantity"
                                type="number"
                                value={formData.quantity}
                                onChange={handleChange}
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
                                onChange={handleChange}
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
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Prezzo Attuale (opzionale)"
                                name="currentPrice"
                                type="number"
                                value={formData.currentPrice}
                                onChange={handleChange}
                                error={!!errors.currentPrice}
                                helperText={errors.currentPrice}
                                inputProps={{ step: "0.01" }}
                            />
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
