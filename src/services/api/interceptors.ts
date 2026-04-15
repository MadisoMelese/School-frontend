import { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setTokens, clearTokens } from './tokenManager';
import { isAuthenticationError } from './errorHandler';

/**
 * Flag to prevent infinite refresh loops
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Setup request interceptor to add Authorization header
 */
export const setupRequestInterceptor = (client: AxiosInstance): void => {
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAccessToken();

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

/**
 * Setup response interceptor to handle 401 errors and token refresh
 */
export const setupResponseInterceptor = (client: AxiosInstance): void => {
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Handle 401 Unauthorized
      if (isAuthenticationError(error) && !originalRequest._retry) {
        if (isRefreshing) {
          // Queue the request if already refreshing
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(client(originalRequest));
              },
              reject: (err: AxiosError) => {
                reject(err);
              },
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt to refresh token
          const response = await client.post('/token', {});
          const { accessToken, refreshToken, expiresIn, refreshExpiresIn } = response.data;

          // Store new tokens
          setTokens(accessToken, refreshToken, expiresIn, refreshExpiresIn);

          // Update authorization header
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Process queued requests
          processQueue(null, accessToken);

          // Retry original request
          return client(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and reject
          clearTokens();
          processQueue(refreshError as AxiosError, null);

          // Redirect to login will be handled by auth store
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Setup all interceptors
 */
export const setupInterceptors = (client: AxiosInstance): void => {
  setupRequestInterceptor(client);
  setupResponseInterceptor(client);
};
