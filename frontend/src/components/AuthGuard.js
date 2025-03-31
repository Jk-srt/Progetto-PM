import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider"; // Assicurati che il percorso sia corretto

const AuthGuard = ({ children }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default AuthGuard;
