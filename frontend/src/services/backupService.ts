import api from './api';

export interface RestoreResponse {
    message: string;
    restored_at: string;
}

// Servicios
export const backupService = {
    createBackup: async (token: string): Promise<Blob> => {
        const response = await fetch('/api/backup/create', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Error al crear la copia de seguridad');
        }
        return await response.blob();
    },

    restoreBackup: async (file: File, token: string): Promise<{ message: string; restored_at: string }> => {
        const formData = new FormData();
        formData.append('file', file);
    
        const response = await fetch('/api/backup/restore', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
            // No pongas 'Content-Type', fetch lo pone automáticamente para FormData
          },
          body: formData
        });
    
        if (!response.ok) {
          throw new Error('Error al restaurar la copia de seguridad');
        }
        return await response.json();
      }
    };