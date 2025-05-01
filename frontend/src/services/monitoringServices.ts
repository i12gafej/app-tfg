import axios from 'axios';

// Interfaces
interface MonitoringTemplateResponse {
  html_content: string;
}

// Crear una instancia de axios con la configuración base
const api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

// Servicios
export const monitoringService = {
  async getMonitoringTemplate(reportId: number, token: string): Promise<string> {
    try {
      const response = await api.get<MonitoringTemplateResponse>(
        `/monitoring-template/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.html_content;
    } catch (error) {
      console.error('Error al obtener la plantilla de monitorización:', error);
      throw error;
    }
  },
};