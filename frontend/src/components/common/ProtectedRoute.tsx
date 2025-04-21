import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [previousPath, setPreviousPath] = useState<string | null>(null);

  useEffect(() => {
    // Si la ruta cambia, actualizamos previousPath
    setPreviousPath(location.pathname);
    
    // Damos tiempo para que el estado se actualice
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Si estamos verificando o venimos de /login, esperamos
  if (isChecking || previousPath === '/login') {
   
    return null;
  }

  // Si no hay autenticación, redirigimos a login
  if (!token || !isAuthenticated) {
    
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  
  return <>{children}</>;
};

export default ProtectedRoute; 