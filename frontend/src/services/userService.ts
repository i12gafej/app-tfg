import axios from 'axios';

interface UserSearchParams {
  search_term?: string;
  name?: string;
  surname?: string;
  email?: string;
  is_admin?: boolean;
}

export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  admin: boolean;
  phone_number: string;
}

// Crear una instancia de axios con la configuración base
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const userService = {
  async searchUsers(params: UserSearchParams, token: string): Promise<User[]> {
    try {
      const response = await api.post<User[]>('/users/search', params, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      throw error;
    }
  }
}; 