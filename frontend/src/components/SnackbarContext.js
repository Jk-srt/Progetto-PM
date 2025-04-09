// File: src/context/SnackbarContext.js
import React, { createContext, useContext } from 'react';
import { useSnackbar } from 'notistack';

const SnackbarContext = createContext();

export const SnackbarProvider = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();

  const showSnackbar = (message, variant = 'info') => {
    enqueueSnackbar(message, {
      variant,
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'right',
      },
      autoHideDuration: 3000,
    });
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
    </SnackbarContext.Provider>
  );
};

export const useSnackbarContext = () => useContext(SnackbarContext);
