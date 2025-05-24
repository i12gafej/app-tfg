import { createContext, useContext } from 'react';


export interface User {
  id: string;
  email: string;
  admin: boolean;
  name: string | null;
  surname: string | null;
  phone_number: string | null;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  token: string | null;
  user: User | null;
  current_user: User | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined); 
 


const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 

export { useAuth };
 
 
 