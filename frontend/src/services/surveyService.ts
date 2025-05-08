import axios from 'axios';

export interface Assessment {
    id: number;
    material_topic_id: number;
    stakeholder_id: number;
    score: number;
}

export interface AssessmentCreate {
    stakeholder_id: number;
    assessments: Array<{
        material_topic_id: number;
        score: number;
    }>;
    report_id: number;
}

export interface AssessmentSearch {
    material_topic_id?: number;
    stakeholder_id?: number;
    is_internal?: boolean;
}

export interface AssessmentResponse {
    items: Assessment[];
    total: number;
}

export interface PrivateSurvey {
    id: number;
    heritage_resource_id: number;
    heritage_resource_name: string;
    year: string;
    survey_state: string;
    scale: number;
}

export interface PrivateSurveySearch {
    search_term?: string;
    heritage_resource_name?: string;
    year?: string;
    page?: number;
    per_page?: number;
}

export interface PrivateSurveyResponse {
    items: PrivateSurvey[];
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

export const surveyService = {
    createAssessments: async (data: AssessmentCreate, token: string): Promise<AssessmentResponse> => {
        try {
            const response = await api.post<AssessmentResponse>('/survey/create/assessments', data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear valoraciones:', error);
            throw error;
        }
    },

    

    searchPrivateSurveys: async (params: PrivateSurveySearch, token: string): Promise<PrivateSurveyResponse> => {
        try {
            const response = await api.post<PrivateSurveyResponse>('/surveys/search/private', params, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al buscar encuestas privadas:', error);
            throw error;
        }
    },

    getAllAssessments: async (reportId: number, token: string): Promise<Assessment[]> => {
        try {
            const response = await api.get<Assessment[]>(`/survey/get-all/assessments/${reportId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener valoraciones:', error);
            throw error;
        }
    }
};
