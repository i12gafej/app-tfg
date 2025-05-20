import { API_URL } from '@/config';
import axios from 'axios';

interface ContactFormData {
  name: string;
  email: string;
  entity?: string;
  position?: string;
  subject: string;
  message: string;
}

// Crear una instancia de axios con la configuración base
const api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

export const emailService = {
  sendContactInfo: async (data: ContactFormData) => {
    try {
      const response = await api.post(`/send/contact-information/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  sendChangePasswordVerification: async (email: string) => {
    try {
      const response = await api.post('/send/change-password-verification/', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 