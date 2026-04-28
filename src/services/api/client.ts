import axios, { AxiosInstance, CancelTokenSource } from 'axios';
import { setupInterceptors } from './interceptors';

/**
 * Configured Axios instance for API communication
 * - Base URL from environment variables
 * - Default headers (Content-Type, Accept)
 * - 15-second timeout (reduced from 30s for better mobile experience)
 * - Request/response interceptors for JWT handling
 * - Request cancellation support
 */

// Store for active requests that can be cancelled
const activeRequests = new Map<string, CancelTokenSource>();

/**
 * Create a cancel token for a request
 * @param requestId Unique identifier for the request
 * @returns Cancel token and cancel function
 */
export function createCancelToken(requestId: string): {
  cancelToken: axios.CancelToken;
  cancel: (message?: string) => void;
} {
  // Cancel any existing request with the same ID
  cancelRequest(requestId);
  
  const source = axios.CancelToken.source();
  activeRequests.set(requestId, source);
  
  return {
    cancelToken: source.token,
    cancel: (message?: string) => {
      source.cancel(message);
      activeRequests.delete(requestId);
    },
  };
}

/**
 * Cancel a specific request by ID
 */
export function cancelRequest(requestId: string, message?: string): void {
  const source = activeRequests.get(requestId);
  if (source) {
    source.cancel(message || 'Request cancelled');
    activeRequests.delete(requestId);
  }
}

/**
 * Cancel all active requests
 */
export function cancelAllRequests(message?: string): void {
  activeRequests.forEach((source, id) => {
    source.cancel(message || `Request ${id} cancelled`);
  });
  activeRequests.clear();
}

/**
 * Check if an error is a cancellation error
 */
export function isCancelError(error: unknown): boolean {
  return axios.isCancel(error);
}

/**
 * Create the API client
 */
const createApiClient = (): AxiosInstance => {
  const apiUrl = (import.meta.env as any).VITE_API_URL || 'http://localhost:5000/api';

  const client = axios.create({
    baseURL: apiUrl,
    timeout: 15000, // 15 seconds (reduced for better mobile experience)
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
