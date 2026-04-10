import axios, { AxiosInstance } from 'axios';
import { setupInterceptors } from './interceptors';

/**
 * Configured Axios instance for API communication
 * - Base URL from environment variables
 * - Default headers (Content-Type, Accept)
 * - 30-second timeout
 * - Request/response interceptors for JWT handling
 */
const createApiClient = (): AxiosInstance => {
  const apiUrl = (import.meta.env as any).VITE_API_URL || 'http://localhost:5000/api';

  const client = axios.create({
    baseURL: apiUrl,
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // Setup interceptors for JWT handling
  setupInterceptors(client);

  return client;
};

export const apiClient = createApiClient();

export default apiClient;
