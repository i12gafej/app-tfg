import api from './api';

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
    scale: number;
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

export interface Survey {
    id: number;
    heritage_resource_id: number;
    heritage_resource_name: string;
    year: string;
    survey_state: string;
    scale: number;
}

export interface SurveysSearch {
    search_term?: string;
    heritage_resource_name?: string;
    year?: string;
}

export interface SurveyResponse {
    items: Survey[];
    total: number;
}



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

    

    searchSurveys: async (params: SurveysSearch, token: string): Promise<{items: Survey[], total: number}> => {
        try {
            const response = await api.post<{items: Survey[], total: number}>('/survey/search/', params, {
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
