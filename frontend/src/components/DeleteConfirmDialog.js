// DeleteConfirmDialog.js (conferma eliminazione)
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    CircularProgress
} from '@mui/material';

const DeleteConfirmDialog = ({
                                 open,
                                 onClose,
                                 onConfirm,
                                 title = "Conferma eliminazione",
                                 content = "Sei sicuro di voler eliminare questo elemento? Questa azione non può essere annullata.",
                                 loading = false
                             }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography>{content}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Annulla
                </Button>
                <Button
                    onClick={onConfirm}
                    color="error"
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : "Elimina"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteConfirmDialog;
