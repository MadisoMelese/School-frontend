import axios from 'axios';

/**
 * Custom error types for different error scenarios
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends Error {
  constructor(
    public errors: Record<string, string[]>,
    message: string = 'Validation failed'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Map API error codes to user-friendly messages
 */
const errorMessageMap: Record<number, string> = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This action conflicts with existing data. Please refresh and try again.',
  422: 'The data you provided is invalid. Please check and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Server error occurred. Please try again later.',
  502: 'Service temporarily unavailable. Please try again later.',
  503: 'Service is under maintenance. Please try again later.',
  504: 'Request timeout. Please check your connection and try again.',
};

/**
 * Get user-friendly error message from API error
 */
export const getUserFriendlyErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    // Handle validation errors (422)
    if (status === 422) {
      const data = error.response?.data as any;
      if (data?.errors && typeof data.errors === 'object') {
        const firstError = Object.values(data.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          return firstError[0];
        }
      }
    }

    // Handle custom error messages from backend
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    // Use mapped message or default
    if (status && errorMessageMap[status]) {
      return errorMessageMap[status];
    }

    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please check your connection and try again.';
    }

    if (!error.response) {
      return 'Network error. Please check your connection and try again.';
    }

    return 'An unexpected error occurred. Please try again.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Transform API error to custom error type
 */
export const transformApiError = (error: unknown): ApiError | ValidationError | NetworkError => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 0;
    const message = getUserFriendlyErrorMessage(error);

    // Handle validation errors
    if (status === 422) {
      const data = error.response?.data as any;
      const validationErrors = data?.errors || {};
      return new ValidationError(validationErrors, message);
    }

    // Handle network errors
    if (!error.response) {
      return new NetworkError(message);
    }

    return new ApiError(status, message, error);
  }

  if (error instanceof Error) {
    return new ApiError(0, error.message, error);
  }

  return new ApiError(0, 'An unexpected error occurred', error);
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return !error.response || error.code === 'ECONNABORTED';
  }
  return false;
};

/**
 * Check if error is an authentication error (401)
 */
export const isAuthenticationError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 401;
  }
  return false;
};

/**
 * Check if error is a validation error (422)
 */
export const isValidationError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 422;
  }
  return false;
};

/**
 * Check if error is a permission error (403)
 */
export const isPermissionError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 403;
  }
  return false;
};

/**
 * Check if error is a not found error (404)
 */
export const isNotFoundError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 404;
  }
  return false;
};

/**
 * Check if error is a server error (5xx)
 */
export const isServerError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    return status ? status >= 500 : false;
  }
  return false;
};
