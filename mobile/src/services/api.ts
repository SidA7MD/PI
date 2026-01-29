import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import Constants from 'expo-constants';

// API Configuration - Priority: 1) Environment var, 2) Expo config, 3) Default
// IMPORTANT: For physical devices, set EXPO_PUBLIC_API_URL in your .env file
// Example: EXPO_PUBLIC_API_URL=http://192.168.1.100:5002/api
const API_URL = process.env.EXPO_PUBLIC_API_URL || 
                Constants.expoConfig?.extra?.apiUrl || 
                'http://10.17.12.218:5001/api';  // Default - uses port 5002 matching backend

console.log('🔧 API Configuration:');
console.log('📍 API_URL:', API_URL);
console.log('📱 Device IP:', Constants.expoConfig?.hostUri?.split(':')[0]);

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Attach token to every request
api.interceptors.request.use(
    async (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔑 Token attached to request');
        }
        
        return config;
    },
    (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Interceptor: Handle global errors
api.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
        return response;
    },
    async (error) => {
        console.log('❌ API Error Details:');
        console.log('  - Message:', error.message);
        console.log('  - Code:', error.code);
        console.log('  - URL:', error.config?.url);
        console.log('  - Base URL:', error.config?.baseURL);
        
        if (error.response) {
            // Server responded with error
            console.log('  - Status:', error.response.status);
            console.log('  - Data:', error.response.data);
            
            if (error.response.status === 401) {
                console.log('🔐 Unauthorized - clearing auth data');
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('user');
                router.replace('/(auth)/login');
            }
        } else if (error.request) {
            // Request made but no response
            console.log('  - No response received');
            console.log('  - Request:', JSON.stringify(error.request, null, 2));
        } else {
            // Error setting up request
            console.log('  - Setup error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

// Test function to check connectivity - uses the health check endpoint
export const testConnection = async (): Promise<boolean> => {
    try {
        console.log('🧪 Testing API connection...');
        const response = await axios.get(`${API_URL}/test`, { timeout: 5000 });
        console.log('✅ Connection test successful:', response.data);
        return true;
    } catch (error: any) {
        console.log('❌ Connection test failed:');
        console.log('  - Error:', error.message);
        console.log('  - API URL:', API_URL);
        
        // Try root endpoint as fallback
        console.log('🔄 Trying root endpoint...');
        try {
            const baseUrl = API_URL.replace('/api', '');
            const altResponse = await axios.get(baseUrl, { timeout: 5000 });
            console.log('✅ Root endpoint connection successful:', altResponse.data);
            return true;
        } catch (altError: any) {
            console.log('❌ Root endpoint also failed:', altError.message);
        }
        
        return false;
    }
};

export default api;