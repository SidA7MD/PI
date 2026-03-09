import React, { FC, ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, spacing, shadows } from '../../theme';

interface GlassCardProps {
    children: ReactNode;
    style?: ViewStyle;
    intensity?: number;
}

export const GlassCard: FC<GlassCardProps> = ({ children, style, intensity = 25 }) => {
    const { colors, theme } = useTheme();

    const isDark = theme === 'dark';

    const cardStyle = [
        styles.card,
        {
            backgroundColor: colors.glass.background,
            borderColor: colors.glass.border,
            ...shadows.lg,
        },
        style,
    ];

    if (Platform.OS === 'ios') {
        return (
            <BlurView
                intensity={intensity}
                tint={isDark ? 'dark' : 'light'}
                style={cardStyle}
            >
                {children}
            </BlurView>
        );
    }

    return (
        <View style={cardStyle}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: borderRadius['2xl'],
        overflow: 'hidden',
        borderWidth: 1,
        padding: spacing.xl,
    },
});
