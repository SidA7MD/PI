import { FC, ReactNode } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius } from '../../theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'danger-outline';
    size?: 'small' | 'medium' | 'large';
    icon?: ReactNode;
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
}

export const Button: FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    icon,
    loading = false,
    disabled = false,
    fullWidth = false,
    style,
}) => {
    const { colors } = useTheme();

    const getBackgroundColor = () => {
        if (disabled) return colors.border.light;
        switch (variant) {
            case 'primary':
                return colors.primary;
            case 'secondary':
                return colors.secondary;
            case 'danger':
                return colors.danger;
            case 'outline':
            case 'danger-outline':
            case 'ghost':
                return 'transparent';
            default:
                return colors.primary;
        }
    };

    const getTextColor = (): string => {
        if (disabled) return colors.text.disabled;
        switch (variant) {
            case 'primary':
            case 'secondary':
            case 'danger':
                return '#FFFFFF';
            case 'outline':
                return colors.primary;
            case 'danger-outline':
                return colors.danger;
            case 'ghost':
                return colors.text.primary;
            default:
                return '#FFFFFF';
        }
    };

    const getBorderColor = () => {
        switch (variant) {
            case 'outline':
                return colors.primary;
            case 'danger-outline':
                return colors.danger;
            default:
                return 'transparent';
        }
    };

    const getPadding = () => {
        switch (size) {
            case 'small':
                return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
            case 'large':
                return { paddingVertical: spacing.md, paddingHorizontal: spacing.xl };
            default:
                return { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg };
        }
    };

    const getFontSize = () => {
        switch (size) {
            case 'small':
                return 14;
            case 'large':
                return 18;
            default:
                return 16;
        }
    };

    const buttonStyles: ViewStyle = {
        backgroundColor: getBackgroundColor(),
        borderRadius: borderRadius.md,
        borderWidth: variant.includes('outline') ? 1 : 0,
        borderColor: getBorderColor(),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...getPadding(),
        ...(fullWidth && { width: '100%' }),
    };

    const textStyles: TextStyle = {
        color: getTextColor(),
        fontSize: getFontSize(),
        fontWeight: '600',
        textAlign: 'center',
    };

    return (
        <TouchableOpacity
            style={[buttonStyles, style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    {icon}
                    <Text style={textStyles}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};
