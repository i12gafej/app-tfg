import { createContext } from 'react';

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
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined); 
 
 
 
 
 