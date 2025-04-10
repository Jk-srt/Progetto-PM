import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Table, Button } from "react-bootstrap";

const TransactionsList = ({ transactions }) => {
  const navigate = useNavigate();

  // Verifica se transactions è definito ed è un array
  if (!transactions || !Array.isArray(transactions)) {
    return <div>Nessuna transazione disponibile</div>;
  }

  return (
    <Container>
      {/* Pulsante posizionato a destra */}
      <div className="d-flex justify-content-end mb-3">
        <Button 
          variant="success" 
          onClick={() => navigate('/add-transaction')}
        >
          Aggiungi Transazione
        </Button>
      </div>

      <Table striped bordered hover responsive>
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
      </Table>
    </Container>
  );
};

export default TransactionsList;
