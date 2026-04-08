import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import { useEffect } from 'react';

const ProtectedRoute = () => {
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
