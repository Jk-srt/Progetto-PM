import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user && location.pathname !== '/login') {
      sessionStorage.setItem('redirectPath', location.pathname);
    }
  }, [user, loading, location]);

  if (loading) return <div>Loading authentication...</div>;

  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
