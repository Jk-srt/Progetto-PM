// services/transactionService.js
const API_URL = '/api/transactions';

export const getTransactions = async () => {
  const response = await fetch(API_URL, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Impossibile recuperare le transazioni');
  }
  
  return response.json();
};

export const addTransaction = async (transaction) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'User-Id': localStorage.getItem('userId') 
    },
    body: JSON.stringify(transaction)
  });
  
  if (!response.ok) {
    throw new Error('Impossibile aggiungere la transazione');
  }
  
  return response.json();
};
