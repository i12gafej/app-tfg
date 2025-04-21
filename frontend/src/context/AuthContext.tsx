import React, { useState, ReactNode, useEffect, useCallback } from 'react';
import { AuthContext, AuthContextType, User } from './auth.context';

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Verificar si hay token al cargar la aplicación
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = useCallback((newToken: string, userData: User) => {
    try {
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      throw error;
    }
  }, []);

  // Debug: monitorear cambios en el estado
  useEffect(() => {
    
  }, [isAuthenticated, token]);

  const contextValue = {
    isAuthenticated,
    token,
    login,
    logout,
    user
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 
 
 
 
 
 