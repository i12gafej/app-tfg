import api from './api';

export interface GraphResponse {
  graph_data_url: string;
}


export const graphsService = {
  async getMainImpactsGraph(reportId: number, token: string): Promise<GraphResponse> {
    try {
      const response = await api.get<GraphResponse>(`/ods/get/main-impacts-graph/${reportId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener gráfica de impactos principales:', error);
      throw error;
    }
  },

  async getSecondaryImpactsGraph(reportId: number, token: string): Promise<GraphResponse> {
    try {
      const response = await api.get<GraphResponse>(`/ods/get/secondary-impacts-graph/${reportId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener gráfica de impactos secundarios:', error);
      throw error;
    }
  }
}; 