import api from './api';

// Interfaces para Objetivos Específicos
export interface SpecificObjective {
  id: number;
  description: string;
  responsible?: string;
  material_topic_id: number;
}

export interface SpecificObjectiveCreate {
  description: string;
  responsible?: string;
  material_topic_id: number;
}

export interface SpecificObjectiveUpdate {
  description?: string;
  responsible?: string;
}

// Interfaces para Acciones
export interface Action {
  id: number;
  description: string;
  difficulty?: 'low' | 'medium' | 'high';
  execution_time?: string;
  ods_id?: number;
  specific_objective_id: number;
}

export interface ActionCreate {
  description: string;
  difficulty?: 'low' | 'medium' | 'high';
  execution_time?: string;
  ods_id?: number;
  specific_objective_id: number;
}

export interface ActionUpdate {
  description?: string;
  difficulty?: 'low' | 'medium' | 'high';
  execution_time?: string;
  ods_id?: number;
}

// Interfaces para Indicadores de Rendimiento
export interface PerformanceIndicatorQuantitativeData {
  numeric_response: number;
  unit: string;
}

export interface PerformanceIndicatorQualitativeData {
  response: string;
}

export interface PerformanceIndicator {
  id: number;
  name: string;
  human_resources?: string;
  material_resources?: string;
  type: 'quantitative' | 'qualitative';
  action_id: number;
  quantitative_data?: PerformanceIndicatorQuantitativeData;
  qualitative_data?: PerformanceIndicatorQualitativeData;
}

export interface PerformanceIndicatorCreate {
  name: string;
  human_resources?: string;
  material_resources?: string;
  type: 'quantitative' | 'qualitative';
  action_id: number;
  numeric_response?: number;
  unit?: string;
  response?: string;
}

export interface PerformanceIndicatorUpdate {
  name?: string;
  human_resources?: string;
  material_resources?: string;
  type?: 'quantitative' | 'qualitative';
  numeric_response?: number;
  unit?: string;
  response?: string;
}

export interface ActionPrimaryImpact {
  ods_id: number | null;
  ods_name: string | null;
  count: number;
}

export interface ActionPrimaryImpactsList {
  items: ActionPrimaryImpact[];
  total: number;
}

export interface DimensionTotal {
  dimension: string;
  total: number;
}

export interface InternalConsistencyGraphResponse {
  graph_data_url: string;
  dimension_totals: DimensionTotal[];
}

export const actionPlanService = {
  // Funciones para Objetivos Específicos
  async getSpecificObjectives(materialTopicId: number, token: string): Promise<SpecificObjective[]> {
    try {
      const response = await api.get<SpecificObjective[]>(`/specific-objectives/get-all/${materialTopicId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener objetivos específicos:', error);
      throw error;
    }
  },

  async createSpecificObjective(objective: SpecificObjectiveCreate, token: string): Promise<SpecificObjective> {
    try {
      const response = await api.post<SpecificObjective>('/specific-objectives/create', objective, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear objetivo específico:', error);
      throw error;
    }
  },

  async updateSpecificObjective(
    objectiveId: number,
    objectiveUpdate: SpecificObjectiveUpdate,
    token: string
  ): Promise<SpecificObjective> {
    try {
      const response = await api.put<SpecificObjective>(
        `/specific-objectives/update/${objectiveId}`,
        objectiveUpdate,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al actualizar objetivo específico:', error);
      throw error;
    }
  },

  async deleteSpecificObjective(objectiveId: number, token: string): Promise<void> {
    try {
      await api.delete(`/specific-objectives/delete/${objectiveId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error al eliminar objetivo específico:', error);
      throw error;
    }
  },

  async getAllResponsibles(reportId: number, token: string): Promise<string[]> {
    try {
      const response = await api.get<string[]>(`/specific-objectives/get-all/responsibles/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener responsables:', error);
      throw error;
    }
  },

  // Funciones para Acciones
  async getActions(specificObjectiveId: number, token: string): Promise<Action[]> {
    try {
      const response = await api.get<Action[]>(`/actions/get-all/${specificObjectiveId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener acciones:', error);
      throw error;
    }
  },

  async createAction(action: ActionCreate, token: string): Promise<Action> {
    try {
      const response = await api.post<Action>('/actions/create', action, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear acción:', error);
      throw error;
    }
  },

  async updateAction(
    actionId: number,
    actionUpdate: ActionUpdate,
    token: string
  ): Promise<Action> {
    try {
      const response = await api.put<Action>(
        `/actions/update/${actionId}`,
        actionUpdate,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al actualizar acción:', error);
      throw error;
    }
  },

  async deleteAction(actionId: number, token: string): Promise<void> {
    try {
      await api.delete(`/actions/delete/${actionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error al eliminar acción:', error);
      throw error;
    }
  },

  // Funciones para Indicadores de Rendimiento
  async getPerformanceIndicators(actionId: number, token: string): Promise<PerformanceIndicator[]> {
    try {
      const response = await api.get<PerformanceIndicator[]>(`/performance-indicators/get-all/${actionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener indicadores de rendimiento:', error);
      throw error;
    }
  },

  async createPerformanceIndicator(
    indicator: PerformanceIndicatorCreate,
    token: string
  ): Promise<PerformanceIndicator> {
    try {
      const response = await api.post<PerformanceIndicator>('/performance-indicators/create', indicator, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear indicador de rendimiento:', error);
      throw error;
    }
  },

  async updatePerformanceIndicator(
    indicatorId: number,
    indicatorUpdate: PerformanceIndicatorUpdate,
    token: string
  ): Promise<PerformanceIndicator> {
    try {
      const response = await api.put<PerformanceIndicator>(
        `/performance-indicators/update/${indicatorId}`,
        indicatorUpdate,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al actualizar indicador de rendimiento:', error);
      throw error;
    }
  },

  async deletePerformanceIndicator(indicatorId: number, token: string): Promise<void> {
    try {
      await api.delete(`/performance-indicators/delete/${indicatorId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error al eliminar indicador de rendimiento:', error);
      throw error;
    }
  },

  async getAllActionPrimaryImpacts(reportId: number, token: string): Promise<ActionPrimaryImpact[]> {
    try {
      const response = await api.get<ActionPrimaryImpactsList>(
        `/actions/get-all/primary-impacts/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data.items;
    } catch (error) {
      console.error('Error al obtener impactos principales de acciones:', error);
      throw error;
    }
  },

  async getInternalConsistencyGraph(reportId: number, token: string): Promise<InternalConsistencyGraphResponse> {
    try {
      const response = await api.get<InternalConsistencyGraphResponse>(
        `/action-plan/get/internal-consistency-graph/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener el gráfico de coherencia interna:', error);
      throw error;
    }
  }
};


