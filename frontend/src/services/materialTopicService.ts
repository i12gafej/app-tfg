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
  goal_ods_id?: number | null;
  goal_number?: string | null;
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

  getMaterialityMatrix: async (reportId: number, token: string, normalize: boolean = false, scale: number) => {
    try {
      const response = await api.post('/material-topics/get/materiality-matrix', {
        report_id: reportId,
        normalize: normalize,
        scale: scale
      }, {
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

/**
 * Ordena los asuntos de materialidad según el siguiente criterio:
 * 1. Sin dimensión (ods_id o goal_ods_id vacío o nulo) primero
 * 2. Luego PERSONAS, PLANETA, PROSPERIDAD, PAZ, ALIANZAS
 * 3. Dentro de cada grupo, por id
 * La función acepta ambos nombres de atributo: ods_id y goal_ods_id
 */
export function sortMaterialTopics<T extends { id: number; ods_id?: number | null | undefined; goal_ods_id?: number | null | undefined }>(topics: T[]): T[] {
  const DIMENSION_ORDER = ['SIN_DIMENSION', 'PERSONAS', 'PLANETA', 'PROSPERIDAD', 'PAZ', 'ALIANZAS'];
  function getDimensionOrder(topic: T): string {
    const ods = topic.ods_id ?? topic.goal_ods_id;
    if (!ods) return 'SIN_DIMENSION';
    if (ods >= 1 && ods <= 5) return 'PERSONAS';
    if ([6, 12, 13, 14, 15].includes(ods)) return 'PLANETA';
    if (ods >= 7 && ods <= 11) return 'PROSPERIDAD';
    if (ods === 16) return 'PAZ';
    if (ods === 17) return 'ALIANZAS';
    return 'SIN_DIMENSION';
  }
  return [...topics].sort((a, b) => {
    const dimA = getDimensionOrder(a);
    const dimB = getDimensionOrder(b);
    const indexA = DIMENSION_ORDER.indexOf(dimA);
    const indexB = DIMENSION_ORDER.indexOf(dimB);
    if (indexA !== indexB) return indexA - indexB;
    return a.id - b.id;
  });
} 