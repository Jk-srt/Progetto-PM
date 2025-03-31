import React, { useState } from "react";
import { useAuth } from "../context/AuthProvider";

const Register = () => {
    const [credentials, setCredentials] = useState({ nome: "", email: "", password: "" });
    const { register } = useAuth();
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        if (!credentials.nome) {
            setError("Il nome è obbligatorio");
            return;
        }
        register(credentials).catch(() => setError("Errore durante la registrazione"));
    };

    return (
        <div className="auth-container">
            <h2>Registrati</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Nome"
                    value={credentials.nome}
                    onChange={(e) => setCredentials({ ...credentials, nome: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                />
                <button type="submit">Registrati</button>
            </form>
            <p>Hai già un account? <a href="/login">Accedi</a></p>
        </div>
    );
};

export default Register;
