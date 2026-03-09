import { FC, useState, ReactNode } from 'react';
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    KeyboardTypeOptions,
    TextStyle,
    ViewStyle,
    I18nManager,
} from 'react-native';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius } from '../../theme';

interface InputProps {
    label?: string;
    value: string;
    onChange: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    keyboardType?: KeyboardTypeOptions;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    error?: string;
    success?: boolean;
    disabled?: boolean;
    multiline?: boolean;
    numberOfLines?: number;
    maxLength?: number;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    onRightIconPress?: () => void;
    large?: boolean;
    centered?: boolean;
    style?: ViewStyle;
    inputStyle?: TextStyle;
    prefix?: string;
}

export const Input: FC<InputProps> = ({
    label,
    value,
    onChange,
    placeholder,
    error,
    success,
    leftIcon,
    rightIcon,
    onRightIconPress,
    large,
    centered,
    style,
    inputStyle: customInputStyle,
    secureTextEntry,
    keyboardType,
    autoCapitalize,
    disabled,
    multiline,
    numberOfLines,
    maxLength,
    prefix,
}) => {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    // Animation for label or border could go here
    const borderOpacity = useSharedValue(0.3);

    const handleFocus = () => {
        setIsFocused(true);
        borderOpacity.value = withTiming(1);
    };

    const handleBlur = () => {
        setIsFocused(false);
        borderOpacity.value = withTiming(0.3);
    };

    const getBorderColor = () => {
        if (error) return colors.status.error;
        if (success) return colors.status.success;
        if (isFocused) return colors.primary;
        return colors.border.medium;
    };

    return (
        <View style={[style, { marginBottom: spacing.md }]}>
            {label && (
                <Text style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: colors.text.secondary,
                    marginBottom: spacing.sm,
                    marginLeft: spacing.xs,
                    letterSpacing: 0.3,
                    textTransform: 'uppercase',
                }}>
                    {label}
                </Text>
            )}

            <Animated.View style={[{
                flexDirection: 'row',
                alignItems: multiline ? 'flex-start' : 'center',
                backgroundColor: colors.background.secondary,
                borderRadius: borderRadius.lg,
                borderWidth: 2,
                borderColor: getBorderColor(),
                paddingHorizontal: spacing.md,
                paddingVertical: large ? spacing.md : spacing.sm + 6,
                minHeight: multiline ? 100 : 52,
            }]}>
                {leftIcon && <View style={{ marginRight: spacing.sm }}>{leftIcon}</View>}

                {prefix && (
                    <Text style={{
                        fontSize: large ? 18 : 16,
                        color: colors.text.primary,
                        marginRight: spacing.xs,
                        fontWeight: '600',
                    }}>
                        {prefix}
                    </Text>
                )}

                <TextInput
                    style={[{
                        flex: 1,
                        fontSize: large ? 18 : 16,
                        color: colors.text.primary,
                        textAlign: centered ? 'center' : (I18nManager.isRTL ? 'right' : 'left'),
                        padding: 0, // Remove default padding
                    }, multiline && { textAlignVertical: 'top', paddingTop: spacing.xs }, customInputStyle]}
                    value={value}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    placeholderTextColor={colors.text.tertiary}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    editable={!disabled}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    maxLength={maxLength}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />

                {rightIcon && (
                    <TouchableOpacity onPress={onRightIconPress} style={{ marginLeft: spacing.sm }}>
                        {rightIcon}
                    </TouchableOpacity>
                )}
            </Animated.View>

            {error && (
                <Text style={{
                    fontSize: 12,
                    color: colors.status.error,
                    marginTop: spacing.xs,
                    marginLeft: spacing.xs,
                }}>
                    {error}
                </Text>
            )}
        </View>
    );
};
