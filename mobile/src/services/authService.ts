import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { User } from '../types';
import { LoginCredentials, RegisterData } from '../types/auth.types';

interface AuthResponse {
    user: User;
    token: string;
    message?: string;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        
        // Save token and user to AsyncStorage
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Set token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        return response.data;
    } catch (error: any) {
        console.error('Login error:', error.response?.data || error.message);
        throw error;
    }
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
        // Remove teacher role option for mobile registration
        if (data.role === 'teacher') {
            throw new Error('Les comptes professeurs doivent être créés via l\'application web');
        }

        const response = await api.post<AuthResponse>('/auth/register', {
            ...data,
            role: 'parent', // Force parent role on mobile
        });
        
        // Save token and user to AsyncStorage
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Set token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        return response.data;
    } catch (error: any) {
        console.error('Register error:', error.response?.data || error.message);
        throw error;
    }
};

export const logout = async (): Promise<void> => {
    try {
        // Call logout endpoint (optional - clears push token)
        await api.post('/auth/logout');
    } catch (error) {
        console.error('Logout API error:', error);
    } finally {
        // Always clear local storage
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
    }
};

export const getMe = async (): Promise<User> => {
    try {
        const response = await api.get<{ user: User }>('/auth/me');
        
        // Update user in AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        
        return response.data.user;
    } catch (error: any) {
        console.error('GetMe error:', error.response?.data || error.message);
        throw error;
    }
};

export const getCurrentUser = async (): Promise<User | null> => {
    try {
        const userStr = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');
        
        if (!userStr || !token) {
            return null;
        }

        // Set token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token is still valid by fetching current user
        try {
            const user = await getMe();
            return user;
        } catch (error) {
            // Token invalid, clear storage
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            return null;
        }
    } catch (error) {
        console.error('GetCurrentUser error:', error);
        return null;
    }
};

export const updateProfile = async (data: {
    username?: string;
    phone?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    pushToken?: string;
}): Promise<User> => {
    try {
        const response = await api.put<{ user: User }>('/auth/me', data);
        
        // Update user in AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        
        return response.data.user;
    } catch (error: any) {
        console.error('UpdateProfile error:', error.response?.data || error.message);
        throw error;
    }
};