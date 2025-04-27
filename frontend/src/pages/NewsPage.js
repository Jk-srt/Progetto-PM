import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Button, Badge } from 'react-bootstrap';
import { fetchMarketNews } from '../services/FinnhubService';

const NewsPage = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [category, setCategory] = useState('general');
    const [newsCount, setNewsCount] = useState(6);

    const loadNews = async (selectedCategory = category) => {
        try {
            setLoading(true);
            const newsData = await fetchMarketNews(selectedCategory, 30);
            setNews(newsData);
            setError(null);
        } catch (err) {
            setError('Errore nel caricamento delle notizie');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNews();
    }, []);

    const handleCategoryChange = (newCategory) => {
        setCategory(newCategory);
        loadNews(newCategory);
    };

    const formatDate = (timestamp) =>
        new Date(timestamp * 1000).toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

    return (
        <Container>
            <h2 className="mb-4">Notizie Finanziarie</h2>

            <div className="mb-4">
                <strong>Categorie:</strong>
                {['general', 'forex', 'crypto', 'merger'].map((cat) => (
                    <Button
                        key={cat}
                        variant={category === cat ? 'primary' : 'outline-primary'}
                        onClick={() => handleCategoryChange(cat)}
                        className="ms-2"
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Button>
                ))}
            </div>

            {loading && <Spinner animation="border" className="d-block mx-auto my-4" />}

            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <Row>
                    {news.slice(0, newsCount).map((article, index) => (
                        <Col key={index} md={6} lg={4} className="mb-4">
                            <Card className="h-100">
                                {article.image && (
                                    <Card.Img
                                        variant="top"
                                        src={article.image}
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                )}
                                <Card.Body>
                                    <Card.Title>{article.headline}</Card.Title>
                                    <Card.Text>{article.summary}</Card.Text>
                                    <div className="d-flex justify-content-between">
                                        <small className="text-muted">{article.source}</small>
                                        <small className="text-muted">{formatDate(article.datetime)}</small>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {news.length > newsCount && (
                <div className="text-center my-4">
                    <Button onClick={() => setNewsCount(p => p + 6)}>
                        Carica altre notizie
                    </Button>
                </div>
            )}
        </Container>
    );
};

export default NewsPage;
