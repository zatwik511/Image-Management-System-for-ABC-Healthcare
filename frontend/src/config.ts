// @ts-ignore - Vite env variable
const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const config = {
  apiUrl: API_URL,
  uploadsUrl: `${API_URL}/uploads`
};
