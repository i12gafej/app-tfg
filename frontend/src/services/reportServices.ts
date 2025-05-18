import axios from 'axios';

export interface ReportNorm {
    id: number;
    norm: string;
    report_id: number;
}

export interface ReportLogo {
    id: number;
    logo: string;
    report_id: number;
}

export interface ReportAgreement {
    id: number;
    agreement: string;
    report_id: number;
}

export interface ReportBibliography {
    id: number;
    reference: string;
    report_id: number;
}

export interface ReportPhoto {
    id: number;
    photo: string;
    description?: string;
    report_id: number;
}

export interface ReportListItem {
    resource_id: number;
    resource_name: string;
    year: number;
    report_id: number;
}
export interface UserReportRole {
    report_id: number;
    role: 'manager' | 'consultant' | 'external_advisor';
    organization: string;
}

export interface SustainabilityReport {
    id: number;
    heritage_resource_id: number;
    heritage_resource_name?: string;
    year: number;
    state: 'Draft' | 'Published';
    survey_state: 'active' | 'inactive';
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
    internal_consistency_description?: string;
    main_impact_weight?: number;
    secondary_impact_weight?: number;
    roadmap_description?: string;
    data_tables_text?: string;
    stakeholders_description?: string;
    materiality_text?: string;
    main_secondary_impacts_text?: string;
    materiality_matrix_text?: string;
    action_plan_text?: string;
    diffusion_text?: string;
    template: boolean;
    norms?: ReportNorm[];
    logos?: ReportLogo[];
    agreements?: ReportAgreement[];
    bibliographies?: ReportBibliography[];
    photos?: ReportPhoto[];
    user_role?: UserReportRole;
}

export interface ReportSearchParams {
    search_term?: string;
    heritage_resource_name?: string;
    year?: number;
    state?: 'Draft' | 'Published';
}

export interface PublicReportSearchParams {
    search_term?: string;
    heritage_resource_name?: string;
    year?: number;
}

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const reportService = {
    getReport: async (id: number, token: string): Promise<SustainabilityReport> => {
        try {
            const response = await api.get<SustainabilityReport>(`/reports/get/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener la memoria:', error);
            throw error;
        }
    },
    async getAllReportTemplates(token: string): Promise<{items: ReportListItem[]}> {
        try {
          const response = await api.get<{items: ReportListItem[]}>(`/reports/get-all/templates/`, { 
            headers: {
              Authorization: `Bearer ${token}`
            }
            }
          );
          return response.data;
        } catch (error) {
          console.error('Error al obtener reportes:', error);
          throw error;
        }
      },

    getReportNorms: async (reportId: number, token: string): Promise<ReportNorm[]> => {
        try {
            const response = await api.get<ReportNorm[]>(`/reports/get-all/norms/${reportId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener las normativas:', error);
            throw error;
        }
    },

    getReportAgreements: async (reportId: number, token: string): Promise<ReportAgreement[]> => {
        try {
            const response = await api.get<ReportAgreement[]>(`/reports/get-all/agreements/${reportId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener los acuerdos:', error);
            throw error;
        }
    },

    updateNorm: async (reportId: number, normId: number, norm: string, token: string): Promise<ReportNorm> => {
        try {
            const response = await api.put<ReportNorm>(`/reports/update/norm/${normId}`, {
                norm,
                report_id: reportId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar la normativa:', error);
            throw error;
        }
    },

    createNorm: async (reportId: number, norm: string, token: string): Promise<ReportNorm> => {
        try {
            const response = await api.post<ReportNorm>('/reports/create/norm', {
                norm,
                report_id: reportId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear la normativa:', error);
            throw error;
        }
    },

    deleteNorm: async (normId: number, token: string): Promise<void> => {
        try {
            await api.delete(`/reports/delete/norm/${normId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error al eliminar la normativa:', error);
            throw error;
        }
    },

    searchReports: async (params: ReportSearchParams, token: string): Promise<{items: SustainabilityReport[], total: number}> => {
        try {
            const response = await api.post<{items: SustainabilityReport[], total: number}>('/reports/search', params, {
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

    generatePreview: async (reportId: number, token: string): Promise<{url: string}> => {
        try {
            const response = await api.get<{url: string}>(`/reports/generate-preview/${reportId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al generar el preview:', error);
            throw error;
        }
    },
    

    searchPublicReports: async (params: PublicReportSearchParams, token: string): Promise<{items: ReportListItem[], total: number}> => {
        try {
            const response = await api.post<{items: ReportListItem[], total: number}>('/public-reports/search', {
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

    updateReport: async (reportId: number, report: Partial<SustainabilityReport>, token: string): Promise<SustainabilityReport> => {
        try {
            
            const response = await api.put<SustainabilityReport>(`/reports/update/${reportId}`, report, {
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
    },

    updateCoverPhoto: async (reportId: number, file: File, token: string): Promise<string> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post<{ url: string }>(
                `/reports/update/cover/${reportId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return response.data.url;
        } catch (error) {
            console.error('Error al actualizar la foto de portada:', error);
            throw error;
        }
    },

    getCoverPhoto: async (reportId: number, token: string, timestamp?: number): Promise<string> => {
        try {
            let url = `/reports/get/cover/${reportId}`;
            if (timestamp) {
                url += `?t=${timestamp}`;
            }
            const response = await api.get<Blob>(
                url,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    responseType: 'blob'
                }
            );
            return URL.createObjectURL(response.data);
        } catch (error) {
            console.error('Error al obtener la foto de portada:', error);
            throw error;
        }
    },

    updateOrganizationChart: async (reportId: number, file: File, token: string): Promise<string> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post<{ url: string }>(
                `/reports/update/organization-chart/${reportId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return response.data.url;
        } catch (error) {
            console.error('Error al actualizar el organigrama:', error);
            throw error;
        }
    },

    getOrganizationChart: async (reportId: number, token: string, timestamp?: number): Promise<string> => {
        try {
            let url = `/reports/get/organization-chart/${reportId}`;
            if (timestamp) {
                url += `?t=${timestamp}`;
            }
            const response = await api.get<Blob>(
                url,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    responseType: 'blob'
                }
            );
            return URL.createObjectURL(response.data);
        } catch (error) {
            console.error('Error al obtener el organigrama:', error);
            throw error;
        }
    },

    deleteOrganizationChart: async (reportId: number, token: string): Promise<void> => {
        try {
            await api.delete(`/reports/delete/organization-chart/${reportId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error al eliminar el organigrama:', error);
            throw error;
        }
    },
    

    
    uploadLogo: async (reportId: number, file: File, token: string): Promise<ReportLogo> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post<ReportLogo>(
                `/reports/upload/logos/${reportId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error al subir el logo:', error);
            throw error;
        }
    },

    getReportLogos: async (reportId: number, token: string): Promise<ReportLogo[]> => {
        try {
            const response = await api.get<ReportLogo[]>(
                `/reports/get-all/logos/${reportId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error al obtener los logos:', error);
            throw error;
        }
    },

    deleteLogo: async (logoId: number, token: string): Promise<void> => {
        try {
            await api.delete(
                `/reports/delete/logo/${logoId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
        } catch (error) {
            console.error('Error al eliminar el logo:', error);
            throw error;
        }
    },

    createAgreement: async (reportId: number, agreement: string, token: string): Promise<ReportAgreement> => {
        try {
            const response = await api.post<ReportAgreement>('/reports/create/agreements', {
                agreement,
                report_id: reportId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear el acuerdo:', error);
            throw error;
        }
    },

    updateAgreement: async (reportId: number, agreementId: number, agreement: string, token: string): Promise<ReportAgreement> => {
        try {
            const response = await api.put<ReportAgreement>(`/reports/update/agreements/${agreementId}`, {
                agreement,
                report_id: reportId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar el acuerdo:', error);
            throw error;
        }
    },

    deleteAgreement: async (agreementId: number, token: string): Promise<void> => {
        try {
            await api.delete(`/reports/delete/agreements/${agreementId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error al eliminar el acuerdo:', error);
            throw error;
        }
    },

    getReportBibliographies: async (reportId: number, token: string): Promise<ReportBibliography[]> => {
        try {
            const response = await api.get<ReportBibliography[]>(`/reports/get-all/bibliographies/${reportId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener las referencias bibliográficas:', error);
            throw error;
        }
    },

    createBibliography: async (reportId: number, reference: string, token: string): Promise<ReportBibliography> => {
        try {
            const response = await api.post<ReportBibliography>('/reports/create/bibliographies', {
                reference,
                report_id: reportId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear la referencia bibliográfica:', error);
            throw error;
        }
    },

    updateBibliography: async (reportId: number, bibliographyId: number, reference: string, token: string): Promise<ReportBibliography> => {
        try {
            const response = await api.put<ReportBibliography>(`/reports/update/bibliographies/${bibliographyId}`, {
                reference,
                report_id: reportId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar la referencia bibliográfica:', error);
            throw error;
        }
    },

    deleteBibliography: async (bibliographyId: number, token: string): Promise<void> => {
        try {
            await api.delete(`/reports/delete/bibliographies/${bibliographyId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error al eliminar la referencia bibliográfica:', error);
            throw error;
        }
    },

    uploadPhoto: async (reportId: number, file: File, token: string, description?: string): Promise<ReportPhoto> => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (description) {
                formData.append('description', description);
            }

            const response = await api.post<ReportPhoto>(
                `/reports/upload/photos/${reportId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error al subir la foto:', error);
            throw error;
        }
    },

    getReportPhotos: async (reportId: number, token: string): Promise<ReportPhoto[]> => {
        try {
            const response = await api.get<ReportPhoto[]>(
                `/reports/get-all/photos/${reportId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error al obtener las fotos:', error);
            throw error;
        }
    },

    deletePhoto: async (photoId: number, token: string): Promise<void> => {
        try {
            await api.delete(
                `/reports/delete/photo/${photoId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
        } catch (error) {
            console.error('Error al eliminar la foto:', error);
            throw error;
        }
    },

    updatePhoto: async (reportId: number, photoId: number, description: string, token: string): Promise<ReportPhoto> => {
        try {
            const response = await api.put<ReportPhoto>(`/reports/update/photo/${photoId}`, {
                description,
                report_id: reportId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar la foto:', error);
            throw error;
        }
    }
};
