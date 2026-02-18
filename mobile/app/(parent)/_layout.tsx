import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useNotifications } from '../../src/context/NotificationContext';
import { useLanguage } from '../../src/context/LanguageContext';

export default function ParentLayout() {
    const { colors } = useTheme();
    const { unreadCount } = useNotifications();
    const { t } = useLanguage();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.text.tertiary,
                tabBarStyle: {
                    backgroundColor: colors.background.card,
                    borderTopColor: colors.border.light,
                },
                headerStyle: {
                    backgroundColor: colors.background.card,
                },
                headerTintColor: colors.text.primary,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: t('myChildren'),
                    headerShown: false,
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="people" size={size} color={color} />
                    ),
                }}
            />
            {/* Bulletins screen removed */}
            <Tabs.Screen
                name="notifications"
                options={{
                    title: t('notifications'),
                    headerShown: false,
                    tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="notifications" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="child/[id]"
                options={{
                    href: null,
                    headerShown: true,
                }}
            />
            <Tabs.Screen
                name="absence/[id]"
                options={{
                    href: null,
                    headerShown: true,
                }}
            />
            <Tabs.Screen
                name="link-child"
                options={{
                    title: t('addChild'),
                    headerShown: false,
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="person-add" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t('profile'),
                    headerShown: false,
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
