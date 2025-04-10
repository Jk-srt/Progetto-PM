import React, { useState } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";

const AssistantPage = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error('Errore nella richiesta:', error);
      setResponse('Si è verificato un errore. Riprova più tardi.');
    }
  };

  return (
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <Card.Title>Assistente Finanziario</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="assistantQuery">
              <Form.Control
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Chiedi consigli finanziari..."
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="mt-3">
              Chiedi
            </Button>
          </Form>
          {response && (
            <div className="mt-3">
              <p><strong>Risposta:</strong></p>
              <p>{response}</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AssistantPage;
