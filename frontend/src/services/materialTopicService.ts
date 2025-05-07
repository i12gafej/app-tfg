import axios from 'axios';

export type PriorityLevel = 'high' | 'medium' | 'low';

interface MaterialTopicSearchParams {
  search_term?: string;
  name?: string;
  report_id?: number;
  page?: number;
  per_page?: number;
}

export interface MaterialTopic {
  id: number;
  name: string;
  description?: string;
  priority?: PriorityLevel;
  main_objective?: string;
  goal_ods_id?: number;
  goal_number?: string;
  report_id: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface MaterialityMatrixData {
  points: {
    [key: number]: {
      x: number;
      y: number;
    };
  };
  dimensions: {
    [key: number]: string;
  };
  topic_names: {
    [key: number]: string;
  };
  dimension_colors: {
    [key: string]: string;
  };
}

export interface MaterialityMatrixResponse {
  matrix_data: MaterialityMatrixData;
  matrix_image: string;
}

// Crear una instancia de axios con la configuración base
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const materialTopicService = {
  async searchMaterialTopics(params: MaterialTopicSearchParams, token: string): Promise<PaginatedResponse<MaterialTopic>> {
    try {
      const response = await api.post<PaginatedResponse<MaterialTopic>>('/material-topics/search', params, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al buscar asuntos de materialidad:', error);
      throw error;
    }
  },

  async updateMaterialTopic(materialTopicId: number, materialTopicData: Partial<MaterialTopic>, token: string): Promise<MaterialTopic> {
    try {
      const response = await api.post<MaterialTopic>('/material-topics/update', {
        id: materialTopicId,
        ...materialTopicData
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar asunto de materialidad:', error);
      throw error;
    }
  },

  async deleteMaterialTopic(materialTopicId: number, token: string): Promise<void> {
    try {
      await api.delete(`/material-topics/${materialTopicId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error al eliminar asunto de materialidad:', error);
      throw error;
    }
  },

  async createMaterialTopic(materialTopicData: Omit<MaterialTopic, 'id'>, token: string): Promise<MaterialTopic> {
    try {
      const response = await api.post<MaterialTopic>('/material-topics/create', materialTopicData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear asunto de materialidad:', error);
      throw error;
    }
  },

  async getAllByReport(reportId: number, token: string): Promise<MaterialTopic[]> {
    try {
      const response = await api.get<MaterialTopic[]>(`/material-topics/get-all/${reportId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener asuntos de materialidad:', error);
      throw error;
    }
  },

  async getMaterialityMatrix(reportId: number, token: string): Promise<MaterialityMatrixResponse> {
    try {
      const response = await api.get<MaterialityMatrixResponse>(`/material-topics/get/materiality-matrix/${reportId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener la matriz de materialidad:', error);
      throw error;
    }
  }
}; 