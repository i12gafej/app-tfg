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
  email: string;
  name: string;
  surname: string;
  admin: boolean;
  phone_number?: string;
}

// Crear una instancia de axios con la configuración base
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const userService = {
  async searchUsers(params: UserSearchParams, token: string): Promise<{items: User[], total: number}> {
    try {
      const response = await api.post<{items: User[], total: number}>('/users/search', params, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      throw error;
    }
  },

  async updateUser(userId: number, userData: Partial<User>, token: string): Promise<User> {
    try {
      const response = await api.post<User>('/users/update', {
        user_id: userId,
        user_data: userData
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  },

  async deleteUser(userId: number, token: string): Promise<void> {
    try {
      await api.delete(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  },

  async createUser(userData: Partial<User> & { password: string }, token: string): Promise<User> {
    try {
      const response = await api.post<User>('/users/create', userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }
}; 