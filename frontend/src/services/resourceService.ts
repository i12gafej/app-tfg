import axios from 'axios';

export interface SocialNetwork {
  network: string;
  url: string;
}

export interface Report {
  id: number;
  heritage_resource_id: number;
  year: number;
}

export interface Resource {
  id: number;
  name: string;
  typology: string[];
  ownership: string;
  management_model: string;
  postal_address: string;
  web_address: string;
  phone_number: string;
  social_networks: SocialNetwork[];
}

export interface ResourceSearchParams {
  search_term?: string;
  name?: string;
  ownership?: string;
  management_model?: string;
  postal_address?: string;
}

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const resourceService = {
  async searchResources(params: ResourceSearchParams, token: string): Promise<{items: Resource[], total: number}> {
    try {
      const response = await api.post<{items: Resource[], total: number}>('/resources/search', {
        search_params: params
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al buscar recursos:', error);
      throw error;
    }
  },

  async getResource(id: number, token: string): Promise<Resource> {
    try {
      const response = await api.get<Resource>(`/resources/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener recurso:', error);
      throw error;
    }
  },

  async createResource(resourceData: Partial<Resource>, token: string): Promise<Resource> {
    try {
      const response = await api.post<Resource>('/resources/create', resourceData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear recurso:', error);
      throw error;
    }
  },

  async updateResource(resourceId: number, resourceData: Partial<Resource>, token: string): Promise<Resource> {
    try {
      const response = await api.put<Resource>(`/resources/update/${resourceId}`, resourceData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar recurso:', error);
      throw error;
    }
  },

  async deleteResource(id: number, token: string): Promise<void> {
    try {
      await api.delete(`/resources/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error al eliminar recurso:', error);
      throw error;
    }
  },

  // Obtener reportes de un recurso
  async getAllReportsByResource(resourceId: string, token: string): Promise<Report[]> {
    try {
      const response = await api.get<{items: Report[]}>(`/resources/get-all/reports/${resourceId}`, { 
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.items;
    } catch (error) {
      console.error('Error al obtener reportes:', error);
      throw error;
    }
  },

  async getAllResources(token: string): Promise<Resource[]> {
    try {
      const response = await api.get('/resources/get-all/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.items;
    } catch (error) {
      console.error('Error getting all resources:', error);
      throw error;
    }
  }
}; 