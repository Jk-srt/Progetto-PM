// services/transactionService.js
const API_URL = 'http://localhost:5000/api/transactions'; // Changed from '/api/transactions' to include the full URL

export const getTransactions = async () => {
  const response = await fetch(API_URL, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'userId': localStorage.getItem('userId')
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
      'userId': localStorage.getItem('userId') 
    },
    body: JSON.stringify(transaction)
  });
  
  if (!response.ok) {
    throw new Error('Impossibile aggiungere la transazione');
  }
  
  return response.json();
};

export const updateTransaction = async (id, transaction) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'userId': localStorage.getItem('userId') 
    },
    body: JSON.stringify(transaction)
  });
  
  if (!response.ok) {
    throw new Error('Impossibile aggiornare la transazione');
  }
  
  return response.json();
};

export const deleteTransaction = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'userId': localStorage.getItem('userId') 
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `Errore del server: ${response.status}`;
      throw new Error(`Impossibile eliminare la transazione: ${errorMessage}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};
