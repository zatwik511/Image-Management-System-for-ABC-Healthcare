import axios from 'axios';
import type { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '');

export const patientClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

patientClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('patientToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

patientClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('patientToken');
      localStorage.removeItem('patientName');
      localStorage.removeItem('patientEmail');
      window.location.href = '/patient-login';
    }
    return Promise.reject(error);
  }
);
