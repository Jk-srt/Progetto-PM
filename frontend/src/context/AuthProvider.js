import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    getAuth,
    onAuthStateChanged,
    signInWithRedirect,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signOut,
    getRedirectResult
} from 'firebase/auth';
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
    const [redirectLoading, setRedirectLoading] = useState(true);  // nuovo stato
    const navigate = useNavigate();

    useEffect(() => {
        console.log("AuthProvider mounted, inizializzo listener auth");
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("onAuthStateChanged → currentUser:", currentUser);
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Gestione risultato del redirect Google
    useEffect(() => {
        console.log("useEffect redirect Google → elaborazione risultato");
        const processRedirect = async () => {
            try {
                const result = await getRedirectResult(auth);
                console.log("getRedirectResult → result:", result);
                if (result) {
                    const idToken = await result.user.getIdToken();
                    console.log("Token da redirect:", idToken);
                    localStorage.setItem('token', idToken);
                    const backendResponse = await registerWithBackend(idToken);
                    console.log("registerWithBackend response:", backendResponse);
                    localStorage.setItem('userId', backendResponse.userId);
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error("Errore nel redirect Google:", error);
                navigate('/login');
            } finally {
                setRedirectLoading(false);      // rilascia il blocco
            }
        };
        processRedirect();
    }, [navigate]);

    const registerWithBackend = async (token) => {
        try {
            const response = await fetch('https://backproject.azurewebsites.net/api/auth/firebase', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || 'Errore nella registrazione');
            }

            localStorage.setItem('userId', responseData.userId); // Salva l'ID utente nel localStorage
            return responseData;
        } catch (error) {
            console.error("Error registering with backend:", error);
            throw error;
        }
    };

    const loginWithGoogle = async () => {
        console.log("loginWithGoogle → avvio signInWithRedirect");
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
    };

    const registerWithEmailPassword = async (email, password, displayName) => {
        try {
            // 1. Crea utente in Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();

            // 2. Registra nel backend usando l'endpoint Firebase
            const backendUser = await registerWithBackend(idToken);

            localStorage.setItem('userId', backendUser.userId);
            navigate('/dashboard');
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                throw new Error("Email già registrata");
            }
            console.error("Errore registrazione:", error);
            throw error;
        }
    };


    const loginWithEmailPassword = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();

            localStorage.setItem('token', idToken);
            const backendResponse = await registerWithBackend(idToken);
            localStorage.setItem('userId', backendResponse.userId);

            navigate('/dashboard');
            return userCredential.user;
        } catch (error) {
            console.error("Errore durante il login:", error);
            navigate('/login');
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
        <AuthContext.Provider value={{
            user,
            loading,
            loginWithGoogle,
            registerWithEmailPassword,
            loginWithEmailPassword,
            logout
        }}>
            {/* attende entrambi */}
            {!loading && !redirectLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
