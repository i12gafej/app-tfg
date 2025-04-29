import axios from 'axios';

export type StakeholderType = 'internal' | 'external';

interface StakeholderSearchParams {
  search_term?: string;
  name?: string;
  type?: StakeholderType;
  report_id?: number;
  page?: number;
  per_page?: number;
}

export interface Stakeholder {
  id: number;
  name: string;
  description: string;
  type: StakeholderType;
  report_id: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Crear una instancia de axios con la configuración base
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const stakeholderService = {
  async searchStakeholders(params: StakeholderSearchParams, token: string): Promise<PaginatedResponse<Stakeholder>> {
    try {
      const response = await api.post<PaginatedResponse<Stakeholder>>('/stakeholders/search', params, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al buscar grupos de interés:', error);
      throw error;
    }
  },

  async updateStakeholder(stakeholderId: number, stakeholderData: Partial<Stakeholder>, token: string): Promise<Stakeholder> {
    try {
      const response = await api.post<Stakeholder>('/stakeholders/update', {
        stakeholder_id: stakeholderId,
        stakeholder_data: stakeholderData
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar grupo de interés:', error);
      throw error;
    }
  },

  async deleteStakeholder(stakeholderId: number, token: string): Promise<void> {
    try {
      await api.delete(`/stakeholders/${stakeholderId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error al eliminar grupo de interés:', error);
      throw error;
    }
  },

  async createStakeholder(stakeholderData: Omit<Stakeholder, 'id'>, token: string): Promise<Stakeholder> {
    try {
      const response = await api.post<Stakeholder>('/stakeholders/create', stakeholderData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear grupo de interés:', error);
      throw error;
    }
  }
};
