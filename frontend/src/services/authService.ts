import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    admin: boolean;
    name: string;
    surname: string;
    phone_number: string;
  };
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        `/login/access-token`,
        credentials
      );
      return response.data;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }

  logout(): void {
    // El logout ahora se maneja completamente en el AuthContext
  }

  // Eliminamos getCurrentToken e isAuthenticated ya que ahora
  // toda la lógica de autenticación se maneja en el contexto
}

export const authService = new AuthService(); 