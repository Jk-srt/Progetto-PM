import axios from 'axios';

const BASE_URL = 'https://backproject.azurewebsites.net/api';

// Funzione per aggiungere una nuova transazione
export const addTransaction = async (transactionData) => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) throw new Error('User ID not found');
    
    // Converti in PascalCase per il backend
    const pascalCaseData = {
      Description: transactionData.description,
      Amount: transactionData.amount,
      Date: transactionData.date,
      CategoryId: transactionData.categoryId,
      UserId: parseInt(userId),
      Type: transactionData.type || 0
    };
    
    const response = await axios.post(`${BASE_URL}/transactions`, pascalCaseData, {
      headers: {
        'userId': userId,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

// Altri metodi per le transazioni
export const getTransactions = async () => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) throw new Error('User ID not found');
    
    const response = await axios.get(`${BASE_URL}/transactions`, {
      headers: {
        'userId': userId
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

// Add to transactionService.js
export const updateTransaction = async (transactionId, transactionData) => {
  const userId = localStorage.getItem('userId');
  const response = await fetch(`https://backproject.azurewebsites.net/api/transactions/${transactionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'userId': userId
    },
    body: JSON.stringify(transactionData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update transaction');
  }
  
  return await response.json();
};

export const deleteTransaction = async (transactionId) => {
  const userId = localStorage.getItem('userId');
  const response = await fetch(`https://backproject.azurewebsites.net/api/transactions/${transactionId}`, {
    method: 'DELETE',
    headers: {
      'userId': userId
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete transaction');
  }
  
  return true;
};
