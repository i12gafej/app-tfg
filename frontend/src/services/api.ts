import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

console.log('API_BASE_URL en api.js:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;