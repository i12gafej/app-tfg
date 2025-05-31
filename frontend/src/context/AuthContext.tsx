import React, { useState, ReactNode, useCallback } from 'react';
import { AuthContext, AuthContextType, User } from './auth.context';

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Ya no verificamos localStorage al cargar la aplicación
  // El usuario tendrá que autenticarse en cada sesión

  const login = useCallback((newToken: string, userData: User) => {
    try {
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      // Ya no guardamos en localStorage
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    try {
      // Limpiamos cualquier resto que pueda haber en localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      throw error;
    }
  }, []);

  const contextValue = {
    isAuthenticated,
    token,
    login,
    logout,
    user,
    current_user: user
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 
 
 
 
 
 