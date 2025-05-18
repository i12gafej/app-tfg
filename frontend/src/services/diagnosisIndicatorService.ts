import axios from 'axios';

export interface DiagnosisIndicatorQuantitativeData {
  diagnosis_indicator_id: number;
  numeric_response: number;
  unit: string;
}

export interface DiagnosisIndicatorQualitativeData {
  diagnosis_indicator_id: number;
  response: string;
}

export interface DiagnosisIndicator {
  id: number;
  name: string;
  type: 'quantitative' | 'qualitative';
  material_topic_id: number;
  quantitative_data?: DiagnosisIndicatorQuantitativeData | null;
  qualitative_data?: DiagnosisIndicatorQualitativeData | null;
}

export interface DiagnosisIndicatorCreate {
  name: string;
  type: 'quantitative' | 'qualitative';
  material_topic_id: number;
  numeric_response?: number;
  unit?: string;
  response?: string;
}

export interface DiagnosisIndicatorUpdate {
  name?: string;
  type?: 'quantitative' | 'qualitative';
  numeric_response?: number;
  unit?: string;
  response?: string;
}

// Crear una instancia de axios con la configuración base
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const diagnosisIndicatorService = {
  async getAllByReport(reportId: number, token: string): Promise<DiagnosisIndicator[]> {
    if (!token) {
      throw new Error('Se requiere un token de autenticación');
    }
    try {
      const response = await api.get<DiagnosisIndicator[]>(`/diagnosis-indicators/get-all/${reportId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener indicadores:', error);
      throw error;
    }
  },

  async getIndicator(indicatorId: number, token: string): Promise<DiagnosisIndicator> {
    if (!token) {
      throw new Error('Se requiere un token de autenticación');
    }
    try {
      const response = await api.get<DiagnosisIndicator>(`/diagnosis-indicators/get/${indicatorId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener indicador:', error);
      throw error;
    }
  },

  async createIndicator(data: DiagnosisIndicatorCreate, token: string): Promise<DiagnosisIndicator> {
    if (!token) {
      throw new Error('Se requiere un token de autenticación');
    }
    try {
      const response = await api.post<DiagnosisIndicator>('/diagnosis-indicators/create', data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear indicador:', error);
      throw error;
    }
  },

  async updateIndicator(indicatorId: number, data: DiagnosisIndicatorUpdate, token: string): Promise<DiagnosisIndicator> {
    if (!token) {
      throw new Error('Se requiere un token de autenticación');
    }
    try {
      const response = await api.put<DiagnosisIndicator>(`/diagnosis-indicators/update/${indicatorId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar indicador:', error);
      throw error;
    }
  },

  async deleteIndicator(indicatorId: number, token: string): Promise<void> {
    if (!token) {
      throw new Error('Se requiere un token de autenticación');
    }
    try {
      await api.delete(`/diagnosis-indicators/delete/${indicatorId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error al eliminar indicador:', error);
      throw error;
    }
  }
};
