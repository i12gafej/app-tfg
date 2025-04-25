import axios from 'axios';

export interface SustainabilityReport {
    id: number;
    heritage_resource_id: number;
    heritage_resource_name?: string;
    year: number;
    state: 'Draft' | 'Published';
    observation: string;
    cover_photo?: string;
    commitment_letter?: string;
    mission?: string;
    vision?: string;
    values?: string;
    org_chart_text?: string;
    org_chart_figure?: string;
    diagnosis_description?: string;
    scale: number;
    permissions: number;
    action_plan_description?: string;
    internal_coherence_description?: string;
    main_impact_weight?: number;
    secondary_impact_weight?: number;
    roadmap_description?: string;
    data_tables_text?: string;
}

export interface ReportSearchParams {
    search_term?: string;
    heritage_resource_name?: string;
    year?: number;
    state?: 'Draft' | 'Published';
    page?: number;
    per_page?: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const reportService = {
    searchReports: async (params: ReportSearchParams, token: string): Promise<PaginatedResponse<SustainabilityReport>> => {
        try {
            const response = await api.post<PaginatedResponse<SustainabilityReport>>('/reports/search', {
                search_params: params
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al buscar memorias:', error);
            throw error;
        }
    },

    createReport: async (report: Omit<SustainabilityReport, 'id'>, token: string): Promise<SustainabilityReport> => {
        try {
            const response = await api.post<SustainabilityReport>('/reports/create', report, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear memoria:', error);
            throw error;
        }
    },

    updateReport: async (id: number, report: Partial<SustainabilityReport>, token: string): Promise<SustainabilityReport> => {
        try {
            const response = await api.post<SustainabilityReport>('/reports/update', {
                report_id: id,
                report_data: report
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar memoria:', error);
            throw error;
        }
    },

    deleteReport: async (id: number, token: string): Promise<void> => {
        try {
            await api.delete(`/reports/delete/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error al eliminar memoria:', error);
            throw error;
        }
    }
};
