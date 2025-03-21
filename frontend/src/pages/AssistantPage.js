import React, { useState } from "react";

const AssistantPage = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5200/api/assistant', {
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
        <div className="card mt-1">
            <h3>Assistente Finanziario</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Chiedi consigli finanziari..."
                />
                <button type="submit">Chiedi</button>
            </form>
            {response && (
                <div className="mt-1">
                    <p><strong>Risposta:</strong></p>
                    <p>{response}</p>
                </div>
            )}
        </div>
    );
};

export default AssistantPage;