import React, { useState } from "react";
import { useAuth } from "../context/AuthProvider";

const Login = () => {
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const { login } = useAuth();
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        login(credentials).catch(() => setError("Credenziali non valide"));
    };

    return (
        <div className="auth-container">
            <h2>Accedi</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
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
                <button type="submit">Login</button>
            </form>
            <p>Non hai un account? <a href="/register">Registrati</a></p>
        </div>
    );
};

export default Login;
