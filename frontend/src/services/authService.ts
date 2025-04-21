import axios from 'axios';

const API_URL = '/api';

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
      const response = await axios.post<AuthResponse>(
        `${API_URL}/login/access-token`,
        credentials
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Error al iniciar sesión');
      }
      throw error;
    }
  }

  logout(): void {
    // Ya no manejamos localStorage aquí
  }

  getCurrentToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentToken();
  }
}

export const authService = new AuthService(); 