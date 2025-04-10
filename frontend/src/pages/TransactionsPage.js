import React from "react";
import { useNavigate } from "react-router-dom"; // Importa per la navigazione

const TransactionsList = ({ transactions }) => {
  const navigate = useNavigate(); // Hook per la navigazione
  
  // Verifico se transactions è definito e se è un array
  if (!transactions || !Array.isArray(transactions)) {
    return <div>Nessuna transazione disponibile</div>;
  }

  return (
    <div>
      {/* Contenitore con stile flex per posizionare il pulsante a destra */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
        <button 
          onClick={() => navigate('/add-transaction')} // Corretto: usa il percorso della pagina
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px 15px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Aggiungi Transazione
        </button>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrizione</th>
            <th>Categoria</th>
            <th>Importo</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.id || Math.random()}>
              <td>{new Date(transaction.date).toLocaleDateString()}</td>
              <td>{transaction.description}</td>
              <td>{transaction.category?.name || 'N/A'}</td>
              <td>${transaction.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsList;
