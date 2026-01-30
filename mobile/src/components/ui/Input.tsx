import { FC, useState, ReactNode } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardTypeOptions,
    TextStyle,
    ViewStyle,
    I18nManager,
} from 'react-native';
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
    prefix?: string; // For phone numbers: +222
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

    const getBorderColor = () => {
        if (error) return colors.danger;
        if (success) return colors.success;
        if (isFocused) return colors.primary;
        return colors.border.medium;
    };

    const containerStyle: ViewStyle = {
        borderWidth: 1,
        borderColor: getBorderColor(),
        borderRadius: borderRadius.md,
        backgroundColor: colors.background.card,
        flexDirection: 'row',
        alignItems: multiline ? 'flex-start' : 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: large ? spacing.md : spacing.sm,
        ...(multiline && { minHeight: 100 }),
    };

    const inputStyle: TextStyle = {
        flex: 1,
        fontSize: large ? 18 : 16,
        color: colors.text.primary,
        textAlign: centered ? 'center' : (I18nManager.isRTL ? 'right' : 'left'),
        ...(multiline && { textAlignVertical: 'top', paddingTop: spacing.sm }),
        ...customInputStyle,
    };

    return (
        <View style={style}>
            {label && (
                <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: colors.text.secondary,
                    marginBottom: spacing.xs,
                    textAlign: 'left', // Always left-aligned for consistency
                }}>
                    {label}
                </Text>
            )}

            <View style={containerStyle}>
                {leftIcon && <View style={{ marginEnd: spacing.sm }}>{leftIcon}</View>}
                
                {prefix && (
                    <Text style={{
                        fontSize: large ? 18 : 16,
                        color: colors.text.secondary,
                        marginEnd: spacing.xs,
                    }}>
                        {prefix}
                    </Text>
                )}

                <TextInput
                    style={inputStyle}
                    value={value}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    placeholderTextColor={colors.text.disabled}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    editable={!disabled}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    maxLength={maxLength}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />

                {rightIcon && (
                    <TouchableOpacity onPress={onRightIconPress} style={{ marginStart: spacing.sm }}>
                        {rightIcon}
                    </TouchableOpacity>
                )}
            </View>

            {error && (
                <Text style={{
                    fontSize: 12,
                    color: colors.danger,
                    marginTop: spacing.xs,
                    textAlign: I18nManager.isRTL ? 'right' : 'left'
                }}>
                    {error}
                </Text>
            )}
        </View>
    );
};
