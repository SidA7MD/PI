import { FC, ReactNode } from 'react';
import {
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    View,
    Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, shadows } from '../../theme';

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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const onPressIn = () => {
        scale.value = withSpring(0.95);
    };

    const onPressOut = () => {
        scale.value = withSpring(1);
    };

    const getGradientColors = () => {
        if (disabled) return [colors.border.light, colors.border.light];
        switch (variant) {
            case 'primary':
                return colors.gradients.primary;
            case 'secondary':
                return colors.gradients.secondary;
            case 'danger':
                return [colors.status.error, colors.status.error];
            default:
                return null;
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
                return colors.status.error;
            case 'ghost':
                return colors.text.primary;
            default:
                return '#FFFFFF';
        }
    };

    const getPadding = () => {
        switch (size) {
            case 'small':
                return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
            case 'large':
                return { paddingVertical: spacing.md, paddingHorizontal: spacing.xl };
            default:
                return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg };
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

    const containerStyles: ViewStyle = {
        borderRadius: borderRadius.xl,
        ...(fullWidth && { width: '100%' }),
        ...(variant !== 'ghost' && variant !== 'outline' && variant !== 'danger-outline' && shadows.md),
        ...(variant === 'outline' && {
            borderWidth: 2,
            borderColor: colors.primary,
            backgroundColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
        }),
        ...(variant === 'danger-outline' && {
            borderWidth: 2,
            borderColor: colors.status.error,
            backgroundColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
        }),
        ...(variant === 'ghost' && {
            backgroundColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
        }),
    };

    const innerStyles: ViewStyle = {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...getPadding(),
    };

    const textStyles: TextStyle = {
        color: getTextColor(),
        fontSize: getFontSize(),
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 0.5,
    };

    const gradientColors = getGradientColors();

    const Content = () => (
        <View style={innerStyles}>
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <>
                    {icon && <View style={{ marginRight: spacing.sm }}>{icon}</View>}
                    <Text style={textStyles}>{title}</Text>
                </>
            )}
        </View>
    );

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={disabled || loading}
            style={[containerStyles, style, animatedStyle]}
        >
            {gradientColors && !['outline', 'ghost', 'danger-outline'].includes(variant) ? (
                <LinearGradient
                    colors={gradientColors as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ borderRadius: borderRadius.xl }}
                >
                    <Content />
                </LinearGradient>
            ) : (
                <Content />
            )}
        </AnimatedPressable>
    );
};
