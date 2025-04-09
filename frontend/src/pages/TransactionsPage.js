import React from "react";

const TransactionsList = ({ transactions }) => {
  // Verifico se transactions è definito e se è un array
  if (!transactions || !Array.isArray(transactions)) {
    return <div>Nessuna transazione disponibile</div>;
  }

  return (
    <div>
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
