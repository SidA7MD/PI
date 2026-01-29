import { FC, ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius } from '../../theme';

interface BadgeProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'small' | 'medium';
    icon?: ReactNode;
    style?: ViewStyle;
}

export const Badge: FC<BadgeProps> = ({
    children,
    variant = 'primary',
    size = 'medium',
    icon,
    style,
}) => {
    const { colors } = useTheme();

    const getBackgroundColor = () => {
        switch (variant) {
            case 'primary':
                return colors.primary;
            case 'secondary':
                return colors.secondary;
            case 'success':
                return colors.success;
            case 'warning':
                return colors.warning;
            case 'danger':
                return colors.danger;
            case 'info':
                return colors.info;
            default:
                return colors.primary;
        }
    };

    const badgeStyle: ViewStyle = {
        backgroundColor: getBackgroundColor(),
        borderRadius: borderRadius.full,
        paddingHorizontal: size === 'small' ? spacing.sm : spacing.md,
        paddingVertical: size === 'small' ? 2 : 4,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
    };

    const textStyle = {
        color: '#FFFFFF',
        fontSize: size === 'small' ? 11 : 13,
        fontWeight: '600' as const,
    };

    return (
        <View style={[badgeStyle, style]}>
            {icon && <View style={{ marginRight: 4 }}>{icon}</View>}
            <Text style={textStyle}>{children}</Text>
        </View>
    );
};
