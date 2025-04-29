import axios from 'axios';

export interface Goal {
  id: number;
  ods_id: number;
  goal_number: string;
  description: string;
}

export interface GoalList {
  items: Goal[];
  total: number;
}

export interface MainImpactUpdate {
  material_topic_id: number;
  goal_ods_id: number;
  goal_number: string;
}

// Crear una instancia de axios con la configuración base
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const goalsService = {
  async getAllGoals(token: string): Promise<GoalList> {
    try {
      const response = await api.get<GoalList>('/goals/get-all', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener todas las metas:', error);
      throw error;
    }
  },

  async getGoalsByODS(odsId: number, token: string): Promise<GoalList> {
    try {
      const response = await api.get<GoalList>(`/goals/get/${odsId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener metas:', error);
      throw error;
    }
  },

  async updateMainImpact(updateData: MainImpactUpdate, token: string): Promise<void> {
    try {
      await api.put('/goals/update/main-impact', updateData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error al actualizar impacto principal:', error);
      throw error;
    }
  }
}; 