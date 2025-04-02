import { auth } from './firebase-config';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleFirebaseLogin = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      
      // Invia token al backend
      const response = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if(response.ok) {
        setUser(result.user);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login: handleFirebaseLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
