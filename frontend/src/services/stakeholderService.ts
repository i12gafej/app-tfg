import api from './api';

export type StakeholderType = 'internal' | 'external';

interface StakeholderSearchParams {
  search_term?: string;
  name?: string;
  type?: StakeholderType;
  report_id?: number;
}

export interface Stakeholder {
  id: number;
  report_id: number;
  name: string;
  description: string;
  type: StakeholderType;
  
}

export interface StakeholderUpdate {
  id: number;
  report_id: number;
  name: string;
  description: string;
  type: StakeholderType;
  
}

 
export const stakeholderService = {
  async searchStakeholders(params: StakeholderSearchParams, token: string): Promise<{items: Stakeholder[], total: number}> {
    try {
      const response = await api.post<{items: Stakeholder[], total: number}>('/stakeholders/search', params, {
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
      const response = await api.put<Stakeholder>(`/stakeholders/update/${stakeholderId}`, stakeholderData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el grupo de interés:', error);
      throw error;
    }
  },

  async deleteStakeholder(stakeholderId: number, token: string): Promise<void> {
    try {
      await api.delete(`/stakeholders/delete/${stakeholderId}`, {
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
  },

  getUserRole: async (reportId: number, token: string): Promise<{ role: 'manager' | 'consultant' | 'external_advisor' }> => {
    try {
      const response = await api.get(`/reports/get/user-role/${reportId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener el rol del usuario:', error);
      throw error;
    }
  },
};
