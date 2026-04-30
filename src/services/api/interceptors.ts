import { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setTokens, clearTokens } from './tokenManager';
import { isAuthenticationError, getUserFriendlyErrorMessage } from './errorHandler';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
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
 * Transforms any Axios error into a plain Error whose .message is the
 * backend's ApiError message (e.g. "Invalid credentials", "User not found").
 * This means every catch block that does `err.message` gets the right text
 * without needing to call getUserFriendlyErrorMessage() everywhere.
 */
const toFriendlyError = (axiosError: AxiosError): Error => {
  const message = getUserFriendlyErrorMessage(axiosError);
  return Object.assign(new Error(message), {
    statusCode: axiosError.response?.status ?? 0,
    isApiError: true,
    originalError: axiosError,
  });
};

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
    (error) => Promise.reject(error)
  );
};

export const setupResponseInterceptor = (client: AxiosInstance): void => {
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // ── Token refresh on 401 ──────────────────────────────────────────────
      if (isAuthenticationError(error) && !originalRequest?._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                if (originalRequest) {
                  originalRequest.headers = originalRequest.headers || {};
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                  resolve(client(originalRequest));
                }
              },
              reject,
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const response = await client.post('/token', {});
          const { accessToken, refreshToken, expiresIn, refreshExpiresIn } = response.data;
          setTokens(accessToken, refreshToken, expiresIn, refreshExpiresIn);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          processQueue(null, accessToken);
          return client(originalRequest);
        } catch (refreshError) {
          clearTokens();
          processQueue(refreshError, null);
          // Reject with a friendly error so the UI shows something useful
          return Promise.reject(toFriendlyError(refreshError as AxiosError));
        } finally {
          isRefreshing = false;
        }
      }

      // ── All other errors: transform to friendly Error ─────────────────────
      return Promise.reject(toFriendlyError(error));
    }
  );
};

export const setupInterceptors = (client: AxiosInstance): void => {
  setupRequestInterceptor(client);
  setupResponseInterceptor(client);
};
