import apiClient from './api.client';
import type { LoginResponse, RegisterRequest, User } from '../types/api.types';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
class AuthService {
    /**
     * Login user with email and password
     */
    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>('/auth/login', {
            email,
            password,
        });

        // Store token and user in localStorage
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('auth_user', JSON.stringify(response.data.user));
        }

        return response.data;
    }

    /**
     * Login user with Google ID token
     */
    async googleLogin(idToken: string): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>('/auth/google-login', {
            idToken,
        });

        // Store token and user in localStorage
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('auth_user', JSON.stringify(response.data.user));
        }

        return response.data;
    }

    /**
     * Register new partner user
     */
    async register(data: RegisterRequest): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>('/auth/register', data);

        // Store token and user in localStorage
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('auth_user', JSON.stringify(response.data.user));
        }

        return response.data;
    }

    /**
     * Register new partner user with Google-verified email
     */
    async googleRegister(data: {
        idToken: string;
        name: string;
        password: string;
        branchName: string;
        branchLocation: string;
    }): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>('/auth/google-register', data);

        // Store token and user in localStorage
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('auth_user', JSON.stringify(response.data.user));
        }

        return response.data;
    }

    /**
     * Logout current user
     */
    logout(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    }

    /**
     * Get current user from localStorage
     */
    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('auth_user');
        if (!userStr) return null;

        try {
            return JSON.parse(userStr) as User;
        } catch {
            return null;
        }
    }

    /**
     * Get current auth token
     */
    getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}

export default new AuthService();
