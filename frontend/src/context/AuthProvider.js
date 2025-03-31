import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const login = async (credentials) => {
        // Simula una chiamata API per il login
        if (credentials.email === "test@example.com" && credentials.password === "password") {
            setUser({ nome: "Mario Rossi", email: credentials.email });
            navigate("/");
        } else {
            throw new Error("Credenziali non valide");
        }
    };

    const register = async (credentials) => {
        // Simula una chiamata API per la registrazione
        if (credentials.email && credentials.password && credentials.nome) {
            navigate("/login");
        } else {
            throw new Error("Errore durante la registrazione");
        }
    };

    const logout = () => {
        setUser(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
