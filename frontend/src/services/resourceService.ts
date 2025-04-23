import axios from 'axios';

export interface SocialNetwork {
  network: string;
  url: string;
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
  typology?: string;
  page?: number;
  per_page?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}


const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const searchResources = async (params: ResourceSearchParams): Promise<PaginatedResponse<Resource>> => {
  const response = await api.post('/team/search/resources', params);
  return response.data;
};

export const getResourceById = async (id: number): Promise<Resource> => {
  const response = await api.get(`/team/resources/${id}`);
  return response.data;
};

export const resourceService = {
  async searchResources(params: ResourceSearchParams, token: string): Promise<PaginatedResponse<Resource>> {
    try {
      const response = await api.post<PaginatedResponse<Resource>>('/resources/search', {
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

  async updateResource(id: number, resourceData: Partial<Resource>, token: string): Promise<Resource> {
    try {
      const response = await api.post<Resource>('/resources/update', {
        resource_id: id,
        resource_data: resourceData
      }, {
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
  }
}; 