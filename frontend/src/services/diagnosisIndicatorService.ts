import axios from 'axios';

export interface DiagnosticIndicatorQuantitativeData {
  diagnostic_indicator_id: number;
  numeric_response: number;
  unit: string;
}

export interface DiagnosticIndicatorQualitativeData {
  diagnostic_indicator_id: number;
  response: string;
}

export interface DiagnosticIndicator {
  id: number;
  name: string;
  type: 'quantitative' | 'qualitative';
  material_topic_id: number;
  quantitative_data?: DiagnosticIndicatorQuantitativeData | null;
  qualitative_data?: DiagnosticIndicatorQualitativeData | null;
}

export interface DiagnosticIndicatorCreate {
  name: string;
  type: 'quantitative' | 'qualitative';
  material_topic_id: number;
  numeric_response?: number;
  unit?: string;
  response?: string;
}

export interface DiagnosticIndicatorUpdate {
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
  async getAllByReport(reportId: number, token: string): Promise<DiagnosticIndicator[]> {
    if (!token) {
      throw new Error('Se requiere un token de autenticación');
    }
    try {
      const response = await api.get<DiagnosticIndicator[]>(`/diagnosis-indicators/get-all/${reportId}`, {
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

  async getIndicator(indicatorId: number, token: string): Promise<DiagnosticIndicator> {
    if (!token) {
      throw new Error('Se requiere un token de autenticación');
    }
    try {
      const response = await api.get<DiagnosticIndicator>(`/diagnosis-indicators/get/${indicatorId}`, {
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

  async createIndicator(data: DiagnosticIndicatorCreate, token: string): Promise<DiagnosticIndicator> {
    if (!token) {
      throw new Error('Se requiere un token de autenticación');
    }
    try {
      const response = await api.post<DiagnosticIndicator>('/diagnosis-indicators/create', data, {
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

  async updateIndicator(indicatorId: number, data: DiagnosticIndicatorUpdate, token: string): Promise<DiagnosticIndicator> {
    if (!token) {
      throw new Error('Se requiere un token de autenticación');
    }
    try {
      const response = await api.put<DiagnosticIndicator>(`/diagnosis-indicators/update/${indicatorId}`, data, {
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
