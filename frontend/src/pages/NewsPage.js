import React, { useEffect, useState } from 'react';

function NewsPage() {
    const [news, setNews] = useState([]);

    useEffect(() => {
        fetch('/Controllers/NewsController.cs')
            .then(response => response.json())
            .then(data => setNews(data))
            .catch(error => console.error('Errore nel recupero delle notizie:', error));
    }, []);

    return (
        <div>
            <h1>Notizie Finanziarie</h1>
            <ul>
                {news.map((article, index) => (
                    <li key={index}>
                        <a href={article.url}>{article.title}</a>
                        <p>{article.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default NewsPage;
