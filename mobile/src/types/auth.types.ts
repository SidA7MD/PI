import { User } from './index';

export interface LoginCredentials {
    email?: string;
    username?: string;
    phone?: string;
    password: string;
}

export interface RegisterData {
    username: string;
    phone?: string;
    email?: string;
    password: string;
    role: 'teacher' | 'parent';
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

export interface AuthResponse {
    user: User;
    token: string;
    message?: string;
}