import axios from 'axios';

export interface Resource {
  id: number;
  name: string;
}

export interface Report {
  id: number;
  year: number;
  heritage_resource_id: number;
}

export interface TeamMember {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  role: string;
  organization: string;
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
  page?: number;
  per_page?: number;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Crear una instancia de axios con la configuración base
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir al login si el token ha expirado
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Obtener recursos patrimoniales
export const getResources = async (): Promise<Resource[]> => {
  const response = await api.post('/team/search/resources', {});
  return response.data.items;
};

// Obtener reportes de un recurso
export const getReports = async (resourceId: string): Promise<Report[]> => {
  const response = await api.post('/team/search/reports', { resource_id: parseInt(resourceId) });
  return response.data.items;
};

// Obtener miembros del equipo de un reporte
export const getTeamMembers = async (reportId: string): Promise<TeamMember[]> => {
  const response = await api.post(`/team/search/members`, {
    report_id: parseInt(reportId),
    page: 1,
    per_page: 1000
  });
  return response.data.items;
};

// Buscar usuarios disponibles para el equipo
export const searchAvailableUsers = async (params: UserSearchParams): Promise<PaginatedResponse<User>> => {
  const response = await api.post('/team/users/search', params);
  return response.data;
};

// Crear un nuevo miembro del equipo
export const createTeamMember = async (
  resourceId: string,
  reportId: string,
  data: {
    name: string;
    surname: string;
    email: string;
    phone: string;
    password: string;
    role: string;
    organization: string;
  }
): Promise<TeamMember> => {
  const response = await api.post(`/reports/${reportId}/team`, data);
  return response.data;
};

// Asignar un usuario al equipo
export const assignUserToTeam = async (
  resourceId: string,
  reportId: string,
  userId: string,
  data: {
    role: string;
    organization: string;
  }
): Promise<TeamMember> => {
  const response = await api.post(`/team/members/assign`, {
    resource_id: resourceId,
    report_id: reportId,
    user_id: userId,
    ...data
  });
  return response.data;
};

// Actualizar un miembro del equipo
export const updateTeamMember = async (
  memberId: string,
  data: {
    role: string;
    organization: string;
  }
): Promise<TeamMember> => {
  const response = await api.put(`/team/members/${memberId}`, data);
  return response.data;
};

// Eliminar un miembro del equipo
export const deleteTeamMember = async (memberId: string): Promise<void> => {
  await api.delete(`/team/members/${memberId}`);
};
