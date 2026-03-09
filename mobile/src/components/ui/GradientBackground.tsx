import React, { FC, ReactNode } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

interface GradientBackgroundProps {
    children: ReactNode;
    style?: ViewStyle;
}

export const GradientBackground: FC<GradientBackgroundProps> = ({ children, style }) => {
    const { colors } = useTheme();

    return (
        <LinearGradient
            colors={colors.gradients.background}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.container, style]}
        >
            {children}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
