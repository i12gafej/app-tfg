import axios from 'axios';

export interface ODS {
  id: number;
  name: string;
  description?: string;
  dimension_id: number;
}

export interface ODSList {
  items: ODS[];
  total: number;
}

export interface SecondaryImpactUpdate {
  material_topic_id: number;
  ods_ids: number[];
}

export interface SecondaryImpactResponse {
  material_topic_id: number;
  ods_ids: number[];
}

// Crear una instancia de axios con la configuración base
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const odsService = {
  async getAllODS(token: string): Promise<ODSList> {
    try {
      const response = await api.get<ODSList>('/ods/get-all', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener ODS:', error);
      throw error;
    }
  },

  async getSecondaryImpacts(materialTopicId: number, token: string): Promise<SecondaryImpactResponse> {
    try {
      const response = await api.get<SecondaryImpactResponse>(`/ods/get/secondary-impacts/${materialTopicId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener impactos secundarios:', error);
      throw error;
    }
  },

  async updateSecondaryImpacts(updateData: SecondaryImpactUpdate, token: string): Promise<SecondaryImpactResponse> {
    try {
      const response = await api.put<SecondaryImpactResponse>('/ods/update/secondary-impacts', updateData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar impactos secundarios:', error);
      throw error;
    }
  }
};
