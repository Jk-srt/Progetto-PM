import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Button, Badge } from "react-bootstrap";
import { fetchMarketNews } from "../services/FinnhubService";

function NewsPage() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [category, setCategory] = useState("general");
    const [newsCount, setNewsCount] = useState(9);

    // Funzione per caricare le notizie
    const loadNews = async (selectedCategory = category) => {
        setLoading(true);
        setError(null);
        try {
            // Utilizziamo direttamente il servizio FinnhubService invece di passare per il backend
            const newsData = await fetchMarketNews(selectedCategory, 30);
            setNews(newsData);
        } catch (err) {
            console.error("Errore nel caricamento delle notizie:", err);
            setError("Impossibile caricare le notizie. Riprova più tardi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNews();
    }, []);

    // Cambia categoria
    const handleCategoryChange = (newCategory) => {
        setCategory(newCategory);
        loadNews(newCategory);
    };

    // Carica altre notizie
    const loadMoreNews = () => {
        setNewsCount(prev => prev + 6);
    };

    // Formatta la data nel formato italiano
    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return new Date(dateString).toLocaleDateString('it-IT', options);
    };

    return (
        <Container className="my-4">
            <h1 className="mb-4">Notizie Finanziarie</h1>
            
            {/* Menu delle categorie */}
            <div className="mb-4">
                <h5 className="mb-2">Categorie:</h5>
                <div className="d-flex flex-wrap gap-2">
                    <Button 
                        variant={category === "general" ? "primary" : "outline-primary"} 
                        onClick={() => handleCategoryChange("general")}
                    >
                        Generali
                    </Button>
                    <Button 
                        variant={category === "forex" ? "primary" : "outline-primary"} 
                        onClick={() => handleCategoryChange("forex")}
                    >
                        Forex
                    </Button>
                    <Button 
                        variant={category === "crypto" ? "primary" : "outline-primary"} 
                        onClick={() => handleCategoryChange("crypto")}
                    >
                        Criptovalute
                    </Button>
                    <Button 
                        variant={category === "merger" ? "primary" : "outline-primary"} 
                        onClick={() => handleCategoryChange("merger")}
                    >
                        Fusioni/Acquisizioni
                    </Button>
                </div>
            </div>

            {/* Stato di caricamento */}
            {loading && (
                <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Caricamento notizie in corso...</p>
                </div>
            )}

            {/* Messaggio di errore */}
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Lista delle notizie */}
            {!loading && !error && news.length === 0 && (
                <p>Nessuna notizia disponibile per questa categoria.</p>
            )}

            {!loading && !error && news.length > 0 && (
                <>
                    <Row>
                        {news.slice(0, newsCount).map((article, index) => (
                            <Col xs={12} md={6} lg={4} key={index} className="mb-4">
                                <Card className="h-100 shadow-sm">
                                    {article.image && (
                                        <Card.Img 
                                            variant="top" 
                                            src={article.image} 
                                            alt={article.headline}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    )}
                                    <Card.Body className="d-flex flex-column">
                                        <div className="mb-2">
                                            {article.category && (
                                                <Badge bg="info" className="me-2">
                                                    {article.category}
                                                </Badge>
                                            )}
                                            {article.source && (
                                                <Badge bg="secondary">
                                                    {article.source}
                                                </Badge>
                                            )}
                                        </div>
                                        <Card.Title>
                                            <a
                                                href={article.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ 
                                                    textDecoration: "none", 
                                                    color: "#007bff",
                                                    fontWeight: "bold"
                                                }}
                                            >
                                                {article.headline}
                                            </a>
                                        </Card.Title>
                                        <Card.Text>
                                            {article.summary || article.headline}
                                        </Card.Text>
                                        <div className="mt-auto text-muted small">
                                            {article.datetime && formatDate(article.datetime * 1000)}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    
                    {/* Pulsante "Carica altre notizie" */}
                    {news.length > newsCount && (
                        <div className="text-center mt-4 mb-5">
                            <Button 
                                variant="outline-primary" 
                                onClick={loadMoreNews}
                            >
                                Carica altre notizie
                            </Button>
                        </div>
                    )}
                </>
            )}
        </Container>
    );
}

export default NewsPage;
