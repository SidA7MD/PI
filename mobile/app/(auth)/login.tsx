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

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const { colors } = useTheme();
    const { t } = useLanguage();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');

        if (!identifier || !password) {
            setError(t('fillAllFields'));
            return;
        }

        setLoading(true);
        try {
            const credentials = identifier.includes('@')
                ? { email: identifier, password }
                : identifier.match(/^[0-9]+$/)
                    ? { phone: identifier, password }
                    : { username: identifier, password };

            await login(credentials);
        } catch (err: any) {
            setError(err.response?.data?.message || t('loginError'));
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
                            <Text style={styles.subtitle}>
                                {t('appSubtitle')}
                            </Text>
                        </View>
                    </LinearGradient>

                    {/* Form Card */}
                    <View style={styles.formContainer}>
                        <View style={[styles.formCard, { backgroundColor: colors.background.card, ...shadows.lg }]}>
                            <Text style={[styles.formTitle, { color: colors.text.primary }]}>
                                {t('loginTitle')}
                            </Text>
                            <Text style={[styles.formSubtitle, { color: colors.text.secondary }]}>
                                {t('welcomeBack') || 'Bienvenue'}
                            </Text>

                            <View style={styles.form}>
                                <Input
                                    label={t('identifierLabel')}
                                    value={identifier}
                                    onChange={setIdentifier}
                                    placeholder={t('identifierPlaceholder')}
                                    autoCapitalize="none"
                                    error={error}
                                />

                                <Input
                                    label={t('passwordLabel')}
                                    value={password}
                                    onChange={setPassword}
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
                                    style={{ marginTop: spacing.md }}
                                />

                                <Button
                                    title={t('loginTitle')}
                                    onPress={handleLogin}
                                    loading={loading}
                                    fullWidth
                                    style={{ marginTop: spacing.xl }}
                                />

                                <Button
                                    title={t('createAccount')}
                                    onPress={() => router.push('/(auth)/register')}
                                    variant="outline"
                                    fullWidth
                                    style={{ marginTop: spacing.md }}
                                />

                                <Button
                                    title={t('forgotPassword')}
                                    onPress={() => router.push('/(auth)/forgot-password')}
                                    variant="ghost"
                                    fullWidth
                                    style={{ marginTop: spacing.sm }}
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
        fontSize: 48,
        fontWeight: '900',
        color: '#FFF',
        marginBottom: spacing.md,
        letterSpacing: 1,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
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
    formTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    formSubtitle: {
        fontSize: 14,
        marginBottom: spacing.xl,
    },
    form: {
        width: '100%',
    },
});
