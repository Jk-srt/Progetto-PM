import React, { useEffect, useState } from "react";

function NewsPage() {
    const [news, setNews] = useState([]); // ⬅️ Stato iniziale come array vuoto

    useEffect(() => {
        fetch("http://localhost:5200/api/news/financial") // ✅ Assicurati che l'URL sia corretto
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
        <div>
            <h1>Notizie Finanziarie</h1>
            {news.length === 0 ? ( // ✅ Mostra un messaggio se non ci sono notizie
                <p>Nessuna notizia disponibile.</p>
            ) : (
                <ul>
                    {news.map((article, index) => (
                        <li key={index}>
                            <a href={article.url}>{article.title}</a>
                            <p>{article.description}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default NewsPage;
