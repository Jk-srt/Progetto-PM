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

const DeleteConfirmDialog = ({ open, onClose, onConfirm, title, content, loading }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title || 'Conferma eliminazione'}</DialogTitle>
      <DialogContent>
        <Typography>
          {content || 'Sei sicuro di voler eliminare questo elemento? Questa azione non può essere annullata.'}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annulla
        </Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          autoFocus
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Elimina'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
