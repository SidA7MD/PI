import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { spacing } from '../../src/theme';
import { validateEmail, validatePhone, validatePassword } from '../../src/utils/validators';

export default function RegisterScreen() {
    const router = useRouter();
    const { register } = useAuth();
    const { colors } = useTheme();
    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        username: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleRegister = async () => {
        const newErrors: Record<string, string> = {};

        // Validation
        if (!formData.username.trim()) {
            newErrors.username = t('usernameRequired');
        } else if (formData.username.length < 3) {
            newErrors.username = t('usernameLength');
        }

        if (!formData.phone.trim()) {
            newErrors.phone = t('phoneRequired');
        } else if (!validatePhone(formData.phone)) {
            newErrors.phone = t('invalidPhone');
        }

        if (formData.email && !validateEmail(formData.email)) {
            newErrors.email = t('invalidEmail');
        }

        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.valid) {
            newErrors.password = t('passwordLength'); // Simplified error for translation mapping if needed, or translate validator messages
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t('passwordMismatch');
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            await register({
                username: formData.username.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim() || undefined,
                password: formData.password,
                role: 'parent', // Always parent for mobile registration
            });
            // Navigation is handled by AuthContext
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || t('registerError');
            setErrors({ general: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: colors.background.primary }]}
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Ionicons name="person-add" size={48} color={colors.primary} />
                    <Text style={[styles.title, { color: colors.text.primary }]}>
                        {t('registerTitle')}
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                        {t('registerSubtitle')}
                    </Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label={t('usernameLabel')}
                        value={formData.username}
                        onChange={(text) => {
                            setFormData({ ...formData, username: text });
                            if (errors.username) {
                                setErrors({ ...errors, username: '' });
                            }
                        }}
                        placeholder={t('usernamePlaceholder')}
                        autoCapitalize="none"
                        error={errors.username}
                    />

                    <Input
                        label={t('phoneLabel')}
                        value={formData.phone}
                        onChange={(text) => {
                            setFormData({ ...formData, phone: text });
                            if (errors.phone) {
                                setErrors({ ...errors, phone: '' });
                            }
                        }}
                        placeholder={t('phonePlaceholder')}
                        keyboardType="phone-pad"
                        error={errors.phone}
                        style={{ marginTop: spacing.md }}
                    />

                    <Input
                        label={t('emailLabel')}
                        value={formData.email}
                        onChange={(text) => {
                            setFormData({ ...formData, email: text });
                            if (errors.email) {
                                setErrors({ ...errors, email: '' });
                            }
                        }}
                        placeholder={t('emailPlaceholder')}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={errors.email}
                        style={{ marginTop: spacing.md }}
                    />

                    <Input
                        label={t('passwordLabel')}
                        value={formData.password}
                        onChange={(text) => {
                            setFormData({ ...formData, password: text });
                            if (errors.password) {
                                setErrors({ ...errors, password: '' });
                            }
                        }}
                        placeholder={t('passwordPlaceholder')}
                        secureTextEntry={!showPassword}
                        rightIcon={
                            <Ionicons
                                name={showPassword ? 'eye-off' : 'eye'}
                                size={20}
                                color={colors.text.tertiary}
                            />
                        }
                        onRightIconPress={() => setShowPassword(!showPassword)}
                        error={errors.password}
                        style={{ marginTop: spacing.md }}
                    />

                    <Input
                        label={t('confirmPasswordLabel')}
                        value={formData.confirmPassword}
                        onChange={(text) => {
                            setFormData({ ...formData, confirmPassword: text });
                            if (errors.confirmPassword) {
                                setErrors({ ...errors, confirmPassword: '' });
                            }
                        }}
                        placeholder={t('confirmPasswordPlaceholder')}
                        secureTextEntry={!showConfirmPassword}
                        rightIcon={
                            <Ionicons
                                name={showConfirmPassword ? 'eye-off' : 'eye'}
                                size={20}
                                color={colors.text.tertiary}
                            />
                        }
                        onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        error={errors.confirmPassword}
                        style={{ marginTop: spacing.md }}
                    />

                    {errors.general && (
                        <View style={[styles.errorContainer, ]}>
                            <Ionicons name="alert-circle" size={20} color={colors.danger} />
                            <Text style={[styles.errorText, { color: colors.danger }]}>
                                {errors.general}
                            </Text>
                        </View>
                    )}

                    <Button
                        title={t('createAccount')}
                        onPress={handleRegister}
                        loading={loading}
                        disabled={loading}
                        fullWidth
                        style={{ marginTop: spacing.xl }}
                    />

                    <View style={styles.infoContainer}>
                        <Ionicons name="information-circle-outline" size={16} color={colors.text.tertiary} />
                        <Text style={[styles.infoText, { color: colors.text.tertiary }]}>
                            {t('teacherAccountNote')}
                        </Text>
                    </View>

                    <Button
                        title={t('alreadyHaveAccount')}
                        onPress={() => router.back()}
                        variant="ghost"
                        fullWidth
                        style={{ marginTop: spacing.md }}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.xl,
        paddingTop: spacing['2xl'],
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginTop: spacing.md,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: 8,
        marginTop: spacing.md,
    },
    errorText: {
        fontSize: 14,
        marginLeft: spacing.sm,
        flex: 1,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
        paddingHorizontal: spacing.sm,
    },
    infoText: {
        fontSize: 12,
        marginLeft: spacing.xs,
        flex: 1,
        lineHeight: 18,
    },
});