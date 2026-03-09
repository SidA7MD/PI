import { User } from './index';

export interface LoginCredentials {
    email?: string;
    username?: string;
    phone?: string;
    identifier?: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string; // Required for unified auth
    password: string;
    role: 'teacher' | 'parent';
    phone?: string;
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