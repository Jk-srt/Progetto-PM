import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

function NewsPage() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/news/financial")
      .then(response => response.json())
      .then(data => {
        console.log("Dati ricevuti:", data);
        // Se data.results contiene l'array delle notizie
        if (data.results && Array.isArray(data.results)) {
          setNews(data.results);
        } else {
          console.error("Formato della risposta non valido:", data);
          setNews([]);
        }
      })
      .catch(error => {
        console.error("Errore nel recupero delle notizie:", error);
        setNews([]);
      });
  }, []);

  return (
    <Container className="my-4">
      <h1 className="mb-4">Notizie Finanziarie</h1>
      {news.length === 0 ? (
        <p>Nessuna notizia disponibile.</p>
      ) : (
        <Row>
          {news.map((article, index) => (
            <Col xs={12} md={6} lg={4} key={index} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none", color: "#007bff" }}
                    >
                      {article.title}
                    </a>
                  </Card.Title>
                  <Card.Text>{article.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default NewsPage;
