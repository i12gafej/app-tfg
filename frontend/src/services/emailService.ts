import api from './api';

interface ContactFormData {
  name: string;
  email: string;
  entity?: string;
  position?: string;
  subject: string;
  message: string;
}


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