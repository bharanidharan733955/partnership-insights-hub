import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types/api.types';

// In production, VITE_BACKEND_URL points to Render backend (e.g. https://your-app.onrender.com)
// In development, it falls back to '/api' which is proxied by Vite to localhost:5000
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/api`
    : '/api';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Flag to prevent multiple simultaneous redirects
let isRedirecting = false;

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
        // Handle specific error cases
        if (error.response) {
            // Server responded with error status
            const apiError = error.response.data;
            const errorMessage = apiError?.error || apiError?.message || 'An error occurred';

            // Handle 401 Unauthorized - clear auth and redirect to login
            if (error.response.status === 401 && !isRedirecting) {
                isRedirecting = true;
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');

                // Only redirect if not already on login page
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }

                // Reset flag after a delay to allow for navigation
                setTimeout(() => { isRedirecting = false; }, 1000);
            }

            return Promise.reject(new Error(errorMessage));
        } else if (error.request) {
            // Request made but no response received
            return Promise.reject(new Error('No response from server. Please check your connection.'));
        } else {
            // Error in request setup
            return Promise.reject(new Error(error.message || 'Request failed'));
        }
    }
);

export default apiClient;
