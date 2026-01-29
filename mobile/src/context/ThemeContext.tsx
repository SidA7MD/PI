import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../theme/colors';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
    theme: 'light' | 'dark';
    themeMode: ThemeMode;
    colors: typeof lightColors;
    setThemeMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const systemTheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');

    const actualTheme = themeMode === 'auto'
        ? (systemTheme || 'light')
        : themeMode;

    const colors = actualTheme === 'dark' ? darkColors : lightColors;

    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        const saved = await AsyncStorage.getItem('theme_mode');
        if (saved) {
            setThemeModeState(saved as ThemeMode);
        }
    };

    const setThemeMode = async (mode: ThemeMode) => {
        setThemeModeState(mode);
        await AsyncStorage.setItem('theme_mode', mode);
    };

    const toggleTheme = () => {
        const newMode = actualTheme === 'light' ? 'dark' : 'light';
        setThemeMode(newMode);
    };

    return (
        <ThemeContext.Provider
            value={{
                theme: actualTheme,
                themeMode,
                colors,
                setThemeMode,
                toggleTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
