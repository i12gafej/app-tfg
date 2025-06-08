import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth.context';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [previousPath, setPreviousPath] = useState<string | null>(null);

  useEffect(() => {
    
    setPreviousPath(location.pathname);
    
    
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  
  if (isChecking || previousPath === '/login') {
   
    return null;
  }

  
  if (!token || !isAuthenticated) {
    
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  
  return <>{children}</>;
};

export default ProtectedRoute; 