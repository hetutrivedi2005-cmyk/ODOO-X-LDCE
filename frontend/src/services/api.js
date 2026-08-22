import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Centralized Bearer token attachment
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('globetrotter_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Human-readable error transformation
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';

    if (!error.response) {
      // Network failure or server down
      message = 'Unable to connect to the server. Please check your internet connection or try again later.';
    } else {
      const status = error.response.status;
      const serverMessage = error.response.data?.message || error.response.data?.error;

      if (serverMessage) {
        message = serverMessage;
      } else if (status === 400) {
        message = 'Invalid input details provided. Please review your entries.';
      } else if (status === 401) {
        message = 'Invalid email or password. Please try again.';
      } else if (status === 409) {
        message = 'An account with this email already exists.';
      } else if (status >= 500) {
        message = 'Internal server error. Please try again later.';
      }
    }

    const customError = {
      message,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error,
    };

    return Promise.reject(customError);
  }
);

export default api;
