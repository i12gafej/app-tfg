import api from './api';

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

export interface SecondaryImpactResponse {
  material_topic_id: number;
  ods_ids: number[];
}

export interface ActionSecondaryImpactResponse {
  action_id: number;
  ods_ids: number[];
}

export interface Dimension {
  name: string;
  description: string;
  ods: ODS[];
}

export interface DimensionResponse {
  dimensions: Dimension[];
}

export interface ActionSecondaryImpactCount {
  ods_id: number;
  ods_name: string;
  count: number;
}

export interface ActionSecondaryImpactCountList {
  items: ActionSecondaryImpactCount[];
  total: number;
}

// Colores para las dimensiones de los ODS
export const DIMENSION_COLORS = {
  PEOPLE: '#D3DDF2',    // ODS 1-5
  PLANET: '#C1DDB0',    // ODS 6,12,13,14,15
  PROSPERITY: '#F9E4C7', // ODS 7-11
  PEACE: '#C6E6F5',     // ODS 16
  PARTNERSHIP: '#DCCAE4',   // ODS 17
};

export const DIMENSION_NAMES = {
  PEOPLE: 'Personas',
  PLANET: 'Planeta',
  PROSPERITY: 'Prosperidad',
  PEACE: 'Paz',
  PARTNERSHIP: 'Alianzas'
};

export const getDimension = (odsId: number | undefined): string => {
  if (!odsId) return '-';
  
  if (odsId >= 1 && odsId <= 5) {
    return DIMENSION_NAMES.PEOPLE;
  }
  if ([6, 12, 13, 14, 15].includes(odsId)) {
    return DIMENSION_NAMES.PLANET;
  }
  if (odsId >= 7 && odsId <= 11) {
    return DIMENSION_NAMES.PROSPERITY;
  }
  if (odsId === 16) {
    return DIMENSION_NAMES.PEACE;
  }
  if (odsId === 17) {
    return DIMENSION_NAMES.PARTNERSHIP;
  }
  
  return '-';
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

 

export const odsService = {
  async getAllODS(token: string): Promise<{items: ODS[], total: number}> {
    try {
      const response = await api.get<{items: ODS[], total: number}>('/ods/get-all', {
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

  async updateSecondaryImpacts(
    materialTopicId: number,
    odsIds: number[],
    token: string
  ): Promise<SecondaryImpactResponse> {
    try {
      const response = await api.put<SecondaryImpactResponse>('/ods/update/secondary-impacts', {
        material_topic_id: materialTopicId,
        ods_ids: odsIds
      }, {
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

  async getActionSecondaryImpacts(actionId: number, token: string): Promise<ActionSecondaryImpactResponse> {
    try {
      const response = await api.get<ActionSecondaryImpactResponse>(
        `/ods/get/action-secondary-impacts/${actionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener impactos secundarios de la acción:', error);
      throw error;
    }
  },

  async updateActionSecondaryImpacts(
    actionId: number,
    odsIds: number[],
    token: string
  ): Promise<ActionSecondaryImpactResponse> {
    try {
      const response = await api.put<ActionSecondaryImpactResponse>(
        `/ods/update/action-secondary-impacts/${actionId}`,
        {
          action_id: actionId,
          ods_ids: odsIds
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al actualizar impactos secundarios de la acción:', error);
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
  },

  async getAllActionSecondaryImpacts(reportId: number, token: string): Promise<ActionSecondaryImpactCount[]> {
    try {
      const response = await api.get<ActionSecondaryImpactCountList>(
        `/ods/get-all/action-secondary-impacts/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data.items;
    } catch (error) {
      console.error('Error al obtener impactos secundarios de acciones:', error);
      throw error;
    }
  }
};

export const ODS_COLORS: { [key: string]: string } = {
  "ODS 1": "#EB1C2D",   "ODS 2": "#D3A029",   "ODS 3": "#279B48",
  "ODS 4": "#C31F33",   "ODS 5": "#EF412C",   "ODS 6": "#01AED9",
  "ODS 7": "#fcc30b",   "ODS 8": "#8F1A39",   "ODS 9": "#F36F28",
  "ODS 10": "#E21A87",  "ODS 11": "#F99D28",  "ODS 12": "#CF8D2A",
  "ODS 13": "#49793F",  "ODS 14": "#007DBC",  "ODS 15": "#3FB04A",
  "ODS 16": "#04568C",  "ODS 17": "#1A386A"
};

export function getODSColor(odsNumber: number): string {
  return ODS_COLORS[`ODS ${odsNumber}`] || "#ccc";
}
