import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, StatusBar, Image } from 'react-native';
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
            await login({ identifier, password });
        } catch (err: any) {
            setError(err.response?.data?.message || t('loginError'));
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
                            style={styles.logoContainer}
                        >
                            <View style={styles.iconContainer}>
                                <Ionicons name="school" size={56} color="#FFF" />
                            </View>
                            <Text style={styles.logoText}>{t('appName')}</Text>
                            <Text style={styles.subtitle}>
                                {t('appSubtitle')}
                            </Text>
                        </Animated.View>

                        <Animated.View
                            entering={FadeInUp.delay(300).duration(800).springify()}
                            style={styles.formContainer}
                        >
                            <GlassCard style={styles.glassCard}>
                                <View style={styles.formHeader}>
                                    <Text style={[styles.formTitle, { color: colors.text.primary }]}>
                                        {t('loginTitle')}
                                    </Text>
                                    <Text style={[styles.formSubtitle, { color: colors.text.secondary }]}>
                                        {t('welcomeBack') || 'Bienvenue'}
                                    </Text>
                                </View>

                                <View style={styles.form}>
                                    <Input
                                        label={t('identifierLabel')}
                                        value={identifier}
                                        onChange={setIdentifier}
                                        placeholder={t('identifierPlaceholder')}
                                        autoCapitalize="none"
                                        keyboardType="default"
                                        error={error}
                                        leftIcon={<Ionicons name="person-outline" size={20} color={colors.text.secondary} />}
                                    />

                                    <Input
                                        label={t('passwordLabel')}
                                        value={password}
                                        onChange={setPassword}
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
                                        style={{ marginTop: spacing.sm }}
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
        justifyContent: 'center',
        paddingVertical: spacing['2xl'],
        paddingHorizontal: spacing.lg,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    iconContainer: {
        width: 88,
        height: 88,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    logoText: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: spacing.xs,
        letterSpacing: 2,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    formContainer: {
        paddingHorizontal: spacing.lg,
    },
    glassCard: {
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.xl,
    },
    formHeader: {
        marginBottom: spacing.xl,
    },
    formTitle: {
        fontSize: 26,
        fontWeight: '700',
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    formSubtitle: {
        fontSize: 15,
        textAlign: 'center',
        opacity: 0.8,
    },
    form: {
        width: '100%',
    },
});
