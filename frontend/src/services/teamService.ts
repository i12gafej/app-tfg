import api from './api';


export interface TeamMember {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  role: string;
  organization: string;
  report_id: number;
  user_id: number;
}

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
}

interface UserSearchParams {
  search_term?: string;
  name?: string;
  surname?: string;
  email?: string;
  role?: string;
  organization?: string;
}



export const teamService = {
  // Obtener miembros del equipo de un reporte
  async getTeamMembers(reportId: string, token: string): Promise<TeamMember[]> {
    try {
      const response = await api.post(`/team/search/members`, {
        report_id: parseInt(reportId)
      },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data.items;
    } catch (error) {
      console.error('Error al obtener miembros del equipo:', error);
      throw error;
    }
  },

  // Buscar usuarios disponibles para el equipo
  async searchAvailableUsers(params: UserSearchParams, token: string): Promise<{items: User[], total: number}> {
    try {
      const response = await api.post<{items: User[], total: number}>('/team/users/search', params, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al buscar usuarios disponibles para el equipo:', error);
      throw error;
    }
  },

  // Crear un nuevo miembro del equipo
  async createTeamMember(
    resourceId: string,
    reportId: string,
    data: {
      name: string;
      surname: string;
      email: string;
      phone_number: string;
      password: string;
      role: string;
      organization: string;
    }
  ,token: string): Promise<TeamMember> {
    try {
      const response = await api.post('/team/create/member', {
        name: data.name,
        surname: data.surname,
        email: data.email,
        phone_number: data.phone_number || undefined,
        password: data.password,
        role: data.role,
        organization: data.organization,
        report_id: parseInt(reportId)
      },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al crear un nuevo miembro del equipo:', error);
      throw error;
    }
  },

  // Asignar un usuario al equipo
  async assignUserToTeam(
    resourceId: string,
    reportId: string,
    userId: string,
    data: {
      role: string;
      organization: string;
    }
  ,token: string): Promise<TeamMember> {
    try {
      const response = await api.post('/team/assign/member', {
        user_id: parseInt(userId),
        report_id: parseInt(reportId),
        role: data.role,
        organization: data.organization
      },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al asignar un usuario al equipo:', error);
      throw error;
    }
  },

  // Actualizar un miembro del equipo
  async updateTeamMember(
    memberId: string,
    data: {
      role: string;
      organization: string;
    }
  ,token: string): Promise<TeamMember> {
    try {
      const response = await api.put(`/team/update/member/${memberId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar un miembro del equipo:', error);
      throw error;
    }
  },

  // Eliminar un miembro del equipo
  async deleteTeamMember(memberId: string, token: string): Promise<void> {
    try {
      await api.delete(`/team/delete/member/${memberId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error al eliminar un miembro del equipo:', error);
      throw error;
    }
  }
};

