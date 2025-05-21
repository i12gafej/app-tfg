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
  async getMonitoringTemplate(reportId: number, token: string): Promise<Blob> {
    try {
      const response = await api.get(
        `/monitoring/get/template/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob', // Importante: especificar que esperamos un blob
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener la plantilla de monitorización:', error);
      throw error;
    }
  },
};