import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
});

// Interfaces
export interface BackupResponse {
    message: string;
    filename?: string;
    created_at: string;
}

export interface RestoreResponse {
    message: string;
    restored_at: string;
}

// Servicios
export const backupService = {
    createBackup: async (token: string): Promise<BackupResponse> => {
        const response = await api.post('/backup/create', {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    restoreBackup: async (file: File, token: string): Promise<RestoreResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/backup/restore', formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};