import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { NotificationProvider } from '../src/context/NotificationContext';
import { LanguageProvider } from '../src/context/LanguageContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

function RootLayoutNav() {
    const { isAuthenticated, isLoading, user } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const { colors } = useTheme();

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inParentGroup = segments[0] === '(parent)';
        const inTeacherGroup = segments[0] === '(teacher)';

        console.log('🔐 Navigation Check:', {
            isAuthenticated,
            userRole: user?.role,
            currentSegment: segments[0],
            inAuthGroup,
        });

        if (!isAuthenticated && !inAuthGroup) {
            // User is not signed in and not in auth screens -> redirect to login
            console.log('📍 Redirecting to login');
            router.replace('/(auth)/login');
        } else if (isAuthenticated && inAuthGroup) {
            // User is signed in but still in auth screens -> redirect based on role
            console.log('📍 Redirecting authenticated user to home');
            if (user?.role === 'teacher') {
                router.replace('/(teacher)');
            } else if (user?.role === 'parent') {
                router.replace('/(parent)');
            }
        } else if (isAuthenticated && user?.role === 'teacher' && !inTeacherGroup) {
            // Teacher trying to access parent screens
            if (!inAuthGroup) {
                console.log('📍 Redirecting teacher to teacher screens');
                router.replace('/(teacher)');
            }
        } else if (isAuthenticated && user?.role === 'parent' && !inParentGroup) {
            // Parent trying to access teacher screens
            if (!inAuthGroup) {
                console.log('📍 Redirecting parent to parent screens');
                router.replace('/(parent)');
            }
        }
    }, [isAuthenticated, isLoading, user, segments]);

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background.primary }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(parent)" />
            <Stack.Screen name="(teacher)" />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <AuthProvider>
                    <NotificationProvider>
                        <StatusBar style="auto" />
                        <RootLayoutNav />
                    </NotificationProvider>
                </AuthProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});