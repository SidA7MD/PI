import { FC, ReactNode } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, shadows } from '../../theme';

interface CardProps {
    children: ReactNode;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    noPadding?: boolean;
}

export const Card: FC<CardProps> = ({
    children,
    onPress,
    style,
    noPadding = false,
}) => {
    const { colors } = useTheme();

    const cardStyle: ViewStyle = {
        backgroundColor: colors.background.card,
        borderRadius: borderRadius.lg,
        padding: noPadding ? 0 : spacing.md,
        ...shadows.md,
    };

    if (onPress) {
        return (
            <TouchableOpacity
                style={[cardStyle, style]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                {children}
            </TouchableOpacity>
        );
    }

    return (
        <View style={[cardStyle, style]}>
            {children}
        </View>
    );
};
