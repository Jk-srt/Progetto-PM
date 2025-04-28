import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Button, Badge, Form } from 'react-bootstrap';
import { fetchMarketNews } from '../services/FinnhubService';

const NewsPage = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [category, setCategory] = useState('general');
    const [newsCount, setNewsCount] = useState(6);
    const [keyword, setKeyword] = useState('');

    const loadNews = async (selectedCategory, searchKeyword) => {
        try {
            setLoading(true);
            console.log('[NewsPage] Chiamo fetchMarketNews con:', selectedCategory, searchKeyword);
            const newsData = await fetchMarketNews(selectedCategory, 30, searchKeyword);
            const filteredNews = newsData.filter(article =>
                article.headline.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                article.summary.toLowerCase().includes(searchKeyword.toLowerCase())
            );
            setNews(filteredNews);
            setError(null);
        } catch (err) {
            setError('Errore nel caricamento delle notizie');
            console.error('[NewsPage] Errore fetchMarketNews:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNews('general', ''); // Load all news by default
        // eslint-disable-next-line
    }, []);

    const handleCategoryChange = (newCategory) => {
        setCategory(newCategory);
        setKeyword('');
        loadNews(newCategory, '');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (keyword.trim() !== '') {
            loadNews('', keyword);
        } else {
            loadNews(category, '');
        }
    };

    const formatDate = (timestamp) =>
        new Date(timestamp * 1000).toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

    const truncateText = (text, maxLength = 150) =>
        text && text.length > maxLength ? text.slice(0, maxLength) + '...' : text;

    return (
        <Container>
            <h2 className="mb-4">Notizie Finanziarie</h2>

            <Form onSubmit={handleSearch} className="mb-3">
                <Form.Group controlId="newsKeyword" className="d-flex">
                    <Form.Control
                        type="text"
                        placeholder="Cerca notizie per parola chiave..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="me-2"
                    />
                    <Button type="submit" variant="primary">Cerca</Button>
                </Form.Group>
            </Form>

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

            {loading && (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
                    <Spinner animation="border" variant="primary" className="me-2" />
                    Caricamento notizie in corso...
                </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && news.length === 0 && (
                <div className="alert alert-info">Nessuna notizia disponibile per questa categoria o parola chiave</div>
            )}

            {!loading && !error && news.length > 0 && (
                <>
                    <Row>
                        {news.slice(0, newsCount).map((article, index) => (
                            <Col key={index} md={4} className="mb-4">
                                <Card
                                    className="h-100 shadow-sm"
                                    onClick={() => window.open(article.url, '_blank')} // Open news in a new tab
                                    style={{ cursor: 'pointer' }}
                                >
                                    {article.image && (
                                        <Card.Img
                                            variant="top"
                                            src={article.image}
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    )}
                                    <Card.Body>
                                        <div className="d-flex justify-content-between mb-2">
                                            {article.category && (
                                                <Badge bg="secondary">{article.category}</Badge>
                                            )}
                                            {article.source && (
                                                <small className="text-muted">{article.source}</small>
                                            )}
                                        </div>
                                        <Card.Title>{article.headline}</Card.Title>
                                        <Card.Text>{truncateText(article.summary)}</Card.Text>
                                        <Card.Footer>
                                            <small className="text-muted">
                                                {article.datetime && formatDate(article.datetime)}
                                            </small>
                                        </Card.Footer>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    {news.length > newsCount && (
                        <div className="d-flex justify-content-center my-4">
                            <Button onClick={() => setNewsCount(prev => prev + 6)} variant="outline-primary">
                                Carica altre notizie
                            </Button>
                        </div>
                    )}
                </>
            )}
        </Container>
    );
};

export default NewsPage;

