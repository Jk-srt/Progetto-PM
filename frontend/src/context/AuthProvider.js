import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyA4kTnlAVRxHmr5MdRH0MWrknyT-z3w7ag",
    authDomain: "finance-management-7c778.firebaseapp.com",
    projectId: "finance-management-7c778",
    storageBucket: "finance-management-7c778.appspot.com",
    messagingSenderId: "41019168831",
    appId: "1:41019168831:web:afb09410b88bfa8b09408a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const idToken = await user.getIdToken();
            const appo=await user.stsTokenManager.accessToken;
            console.log('ID Token:', appo); // Debug: verifica l'ID token
            localStorage.setItem('token', appo); // Salva l'utente nel localStorage

            const response = await fetch('http://localhost:5000/api/auth/firebase', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                }
            });

            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || 'Errore nella registrazione');
            }
            localStorage.setItem('userId', responseData.userId); // Salva l'ID utente nel localStorage

            console.log('Utente registrato/aggiornato:', responseData);
            navigate('/dashboard');
        } catch (error) {
            console.error("Errore durante il login:", error);
            alert(error.message);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            navigate('/login');
            localStorage.removeItem('token'); // Rimuovi il token dal localStorage
            localStorage.removeItem('userId'); // Rimuovi l'ID utente dal localStorage
            localStorage.removeItem('GoogleUser'); // Rimuovi l'utente Google dal localStorage
            localStorage.removeItem('categories');
            console.log("Utente disconnesso con successo");
        } catch (error) {
            console.error("Errore durante il logout:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
