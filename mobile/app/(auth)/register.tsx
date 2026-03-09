import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { GradientBackground } from '../../src/components/ui/GradientBackground';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { spacing, shadows } from '../../src/theme';
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

        if (!formData.email.trim() || !validateEmail(formData.email)) {
            newErrors.email = t('invalidEmail');
        }

        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.valid) {
            newErrors.password = t('passwordLength');
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
            // Auto-prepend +222 to phone number
            const phoneWithPrefix = formData.phone.startsWith('+222')
                ? formData.phone
                : `+222${formData.phone}`;

            await register({
                username: formData.username.trim(),
                phone: phoneWithPrefix,
                email: formData.email.trim(),
                password: formData.password,
                role: 'parent',
            });
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || t('registerError');
            setErrors({ general: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <GradientBackground>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Animated.View
                            entering={FadeInDown.delay(100).duration(800).springify()}
                            style={styles.headerContainer}
                        >
                            <View style={styles.iconContainer}>
                                <Ionicons name="person-add" size={44} color="#FFF" />
                            </View>
                            <Text style={styles.title}>
                                {t('registerTitle')}
                            </Text>
                            <Text style={styles.subtitle}>
                                {t('registerSubtitle')}
                            </Text>
                        </Animated.View>

                        <Animated.View
                            entering={FadeInUp.delay(300).duration(800).springify()}
                            style={styles.formContainer}
                        >
                            <GlassCard style={styles.glassCard}>
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
                                        leftIcon={<Ionicons name="person-outline" size={20} color={colors.text.secondary} />}
                                    />

                                    <Input
                                        label={t('phoneLabel')}
                                        value={formData.phone}
                                        onChange={(text) => {
                                            // Only allow digits, max 8 characters
                                            const digitsOnly = text.replace(/\D/g, '').slice(0, 8);
                                            setFormData({ ...formData, phone: digitsOnly });
                                            if (errors.phone) {
                                                setErrors({ ...errors, phone: '' });
                                            }
                                        }}
                                        placeholder="XX XX XX XX"
                                        keyboardType="phone-pad"
                                        error={errors.phone}
                                        style={{ marginTop: spacing.md }}
                                        prefix="+222"
                                        maxLength={11}
                                        leftIcon={<Ionicons name="call-outline" size={20} color={colors.text.secondary} />}
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
                                        leftIcon={<Ionicons name="mail-outline" size={20} color={colors.text.secondary} />}
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
                                        leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.text.secondary} />}
                                        rightIcon={
                                            <Ionicons
                                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
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
                                        leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.text.secondary} />}
                                        rightIcon={
                                            <Ionicons
                                                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                                size={20}
                                                color={colors.text.tertiary}
                                            />
                                        }
                                        onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        error={errors.confirmPassword}
                                        style={{ marginTop: spacing.md }}
                                    />

                                    {errors.general && (
                                        <View style={[styles.errorContainer, { backgroundColor: colors.status.error + '15' }]}>
                                            <Ionicons name="alert-circle" size={20} color={colors.status.error} />
                                            <Text style={[styles.errorText, { color: colors.status.error }]}>
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

                                    <View style={[styles.infoContainer, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
                                        <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
                                        <Text style={[styles.infoText, { color: colors.text.secondary }]}>
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
                            </GlassCard>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: spacing.xl,
    },
    headerContainer: {
        alignItems: 'center',
        marginTop: spacing.xl,
        marginBottom: spacing.lg,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: spacing.xs,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '500',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    formContainer: {
        paddingHorizontal: spacing.lg,
    },
    glassCard: {
        padding: spacing.xl,
    },
    form: {
        width: '100%',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: 14,
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    errorText: {
        fontSize: 14,
        flex: 1,
        fontWeight: '500',
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
        padding: spacing.md,
        borderRadius: 14,
        borderWidth: 1,
        gap: spacing.sm,
    },
    infoText: {
        fontSize: 12,
        flex: 1,
        lineHeight: 18,
    },
});
