import axios from 'axios';

export interface ODS {
  id: number;
  name: string;
  description: string;
  dimension: string;
}

export interface Dimension {
  name: string;
  description: string;
  ods: ODS[];
}

export interface DimensionResponse {
  dimensions: Dimension[];
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

// Colores para las dimensiones de los ODS
export const DIMENSION_COLORS = {
  PEOPLE: '#D3DDF2',    // ODS 1-5
  PLANET: '#C1DDB0',    // ODS 6,12,13,14,15
  PROSPERITY: '#F9E4C7', // ODS 7-11
  PEACE: '#C6E6F5',     // ODS 16
  PARTNERSHIP: '#DCCAE4',   // ODS 17
};

export const getBackgroundColor = (odsId: number | undefined): string => {
  if (!odsId) return 'transparent';
  
  if (odsId >= 1 && odsId <= 5) {
    return DIMENSION_COLORS.PEOPLE;
  }
  if ([6, 12, 13, 14, 15].includes(odsId)) {
    return DIMENSION_COLORS.PLANET;
  }
  if (odsId >= 7 && odsId <= 11) {
    return DIMENSION_COLORS.PROSPERITY;
  }
  if (odsId === 16) {
    return DIMENSION_COLORS.PEACE;
  }
  if (odsId === 17) {
    return DIMENSION_COLORS.PARTNERSHIP;
  }
  
  return 'transparent';
};

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
  },

  async getAllDimensions(token: string): Promise<DimensionResponse> {
    try {
      const response = await api.get<DimensionResponse>('/ods/get-all/dimensions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener dimensiones:', error);
      throw error;
    }
  }
};
