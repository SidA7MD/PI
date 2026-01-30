import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
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

        if (formData.email && !validateEmail(formData.email)) {
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
                email: formData.email.trim() || undefined,
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
        <>
            <SafeAreaView style={{ flex: 0, backgroundColor: colors.primary }} />
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.container, { backgroundColor: colors.background.secondary }]}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Gradient Header */}
                    <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.header}
                    >
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoText}>Kbarwilly</Text>
                            <Text style={styles.title}>
                                {t('registerTitle')}
                            </Text>
                            <Text style={styles.subtitle}>
                                {t('registerSubtitle')}
                            </Text>
                        </View>
                    </LinearGradient>

                    {/* Form Card */}
                    <View style={styles.formContainer}>
                        <View style={[styles.formCard, { backgroundColor: colors.background.card, ...shadows.lg }]}>
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
                                    <View style={[styles.errorContainer, { backgroundColor: colors.danger + '15' }]}>
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
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
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
    header: {
        paddingTop: spacing.xl,
        paddingBottom: spacing['3xl'],
        paddingHorizontal: spacing.xl,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoText: {
        fontSize: 42,
        fontWeight: '900',
        color: '#FFF',
        marginBottom: spacing.md,
        letterSpacing: 1,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
        textAlign: 'center',
    },
    formContainer: {
        flex: 1,
        marginTop: -40,
        paddingHorizontal: spacing.lg,
    },
    formCard: {
        borderRadius: 24,
        padding: spacing.xl,
        marginBottom: spacing.xl,
    },
    form: {
        width: '100%',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: 12,
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
        borderRadius: 12,
        borderWidth: 1,
        gap: spacing.sm,
    },
    infoText: {
        fontSize: 12,
        flex: 1,
        lineHeight: 18,
    },
});
