import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

function NewsPage() {
    const [news, setNews] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/api/news/financial")
            .then(response => response.json())
            .then(data => {
                console.log("Dati ricevuti:", data); // 🔹 Log della risposta per debug

                // Se la risposta è un array (Finnhub di solito restituisce un array di oggetti)
                if (Array.isArray(data)) {
                    setNews(data.slice(0, 9)); // Limita a 9 notizie
                } else {
                    console.error("Formato della risposta non valido:", data);
                    setNews([]); // Reset in caso di errore
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
                                            {article.headline} {/* ✅ Cambiato da title a headline */}
                                        </a>
                                    </Card.Title>
                                    <Card.Text>{article.summary}</Card.Text> {/* ✅ Cambiato da description a summary */}
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