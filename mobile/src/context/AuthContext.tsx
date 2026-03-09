import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as authService from '../services/authService';
import { useLanguage } from './LanguageContext';
import { User } from '../types';
import { AuthState, LoginCredentials, RegisterData } from '../types/auth.types';

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
    | { type: 'SET_USER'; payload: { user: User; token: string } }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'SET_USER':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
            };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'LOGOUT':
            return {
                user: null,
                token: null,
                isLoading: false,
                isAuthenticated: false,
            };
        default:
            return state;
    }
};

const initialState: AuthState = {
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const router = useRouter();
    const { setLanguage } = useLanguage();

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            console.log('🔍 Checking auth status...');
            const user = await authService.getCurrentUser();
            if (user) {
                const token = await AsyncStorage.getItem('token');
                console.log('✅ User found:', user.username, 'Role:', user.role);

                // Apply user language preference if available
                if (user.language) {
                    console.log('🌐 Applying user language:', user.language);
                    await setLanguage(user.language as any);
                }

                dispatch({ type: 'SET_USER', payload: { user, token: token || '' } });
            } else {
                console.log('❌ No user found');
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        } catch (error) {
            console.error('❌ Auth check failed:', error);
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const login = async (credentials: LoginCredentials) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            console.log('🔐 Logging in...');
            const { user, token } = await authService.login(credentials);
            console.log('✅ Login successful:', user.username, 'Role:', user.role);

            // Apply user language preference if available
            if (user.language) {
                console.log('🌐 Applying user language:', user.language);
                await setLanguage(user.language as any);
            }

            dispatch({ type: 'SET_USER', payload: { user, token } });

            // Navigate based on role
            if (user.role === 'teacher') {
                console.log('📍 Navigating to teacher home');
                router.replace('/(teacher)');
            } else if (user.role === 'parent') {
                console.log('📍 Navigating to parent home');
                router.replace('/(parent)');
            } else if (user.role === 'school') {
                console.log('⚠️ School accounts are web-only');
                await authService.logout();
                dispatch({ type: 'LOGOUT' });
                throw new Error('Les comptes école ne peuvent se connecter que via l\'interface web');
            } else {
                console.log('⚠️ Unknown role:', user.role);
                router.replace('/(parent)'); // Default fallback
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            dispatch({ type: 'SET_LOADING', payload: false });
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            console.log('📝 Registering new user...');
            await authService.register(data);
            console.log('✅ Registration successful');

            // Ne pas connecter automatiquement : déconnecter et rediriger vers login
            await authService.logout();
            dispatch({ type: 'LOGOUT' });
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('❌ Registration error:', error);
            dispatch({ type: 'SET_LOADING', payload: false });
            throw error;
        }
    };

    const logout = async () => {
        console.log('🚪 Logging out...');
        await authService.logout();
        dispatch({ type: 'LOGOUT' });
        console.log('📍 Navigating to login');
        router.replace('/(auth)/login');
    };

    const refreshUser = async () => {
        try {
            console.log('🔄 Refreshing user data...');
            const user = await authService.getMe();
            const token = state.token || '';
            dispatch({ type: 'SET_USER', payload: { user, token } });
            console.log('✅ User refreshed');
        } catch (error) {
            console.error('❌ Failed to refresh user:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};