import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { GradientBackground } from '../../src/components/ui/GradientBackground';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { spacing, shadows } from '../../src/theme';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { t } = useLanguage();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleResetPassword = async () => {
        setError('');

        if (!email) {
            setError(t('enterEmailPrompt'));
            return;
        }

        setLoading(true);
        try {
            // TODO: Implement forgot password API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSuccess(true);
        } catch (err: any) {
            setError(t('emailSendError'));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <GradientBackground>
                <StatusBar barStyle="light-content" />
                <SafeAreaView style={{ flex: 1 }}>
                    <Animated.View
                        entering={FadeInDown.duration(1000).springify()}
                        style={styles.successContainer}
                    >
                        <GlassCard style={styles.successCard}>
                            <View style={[styles.successIconContainer, { backgroundColor: colors.status.success + '20', borderColor: colors.status.success }]}>
                                <Ionicons name="checkmark-circle" size={56} color={colors.status.success} />
                            </View>
                            <Text style={[styles.successTitle, { color: colors.text.primary }]}>
                                {t('emailSent')}
                            </Text>
                            <Text style={[styles.successText, { color: colors.text.secondary }]}>
                                {t('checkEmailInbox')}
                            </Text>
                            <Button
                                title={t('backToLogin')}
                                onPress={() => router.back()}
                                fullWidth
                                style={{ marginTop: spacing.xl }}
                            />
                        </GlassCard>
                    </Animated.View>
                </SafeAreaView>
            </GradientBackground>
        );
    }

    return (
        <GradientBackground>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View
                        entering={FadeInDown.delay(100).duration(800).springify()}
                        style={styles.headerContainer}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons name="lock-open" size={44} color="#FFF" />
                        </View>
                        <Text style={styles.title}>
                            {t('forgotPasswordTitle')}
                        </Text>
                        <Text style={styles.subtitle}>
                            {t('forgotPasswordSubtitle')}
                        </Text>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInUp.delay(300).duration(800).springify()}
                        style={styles.formContainer}
                    >
                        <GlassCard style={styles.glassCard}>
                            <View style={styles.form}>
                                <Input
                                    label={t('emailLabel')}
                                    value={email}
                                    onChange={setEmail}
                                    placeholder={t('emailPlaceholder')}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    error={error}
                                    leftIcon={<Ionicons name="mail-outline" size={20} color={colors.text.secondary} />}
                                />

                                <Button
                                    title={t('sendResetLink')}
                                    onPress={handleResetPassword}
                                    loading={loading}
                                    fullWidth
                                    style={{ marginTop: spacing.xl }}
                                />

                                <Button
                                    title={t('back')}
                                    onPress={() => router.back()}
                                    variant="ghost"
                                    fullWidth
                                    style={{ marginTop: spacing.md }}
                                />
                            </View>
                        </GlassCard>
                    </Animated.View>
                </ScrollView>
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
        fontSize: 26,
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
        lineHeight: 22,
        paddingHorizontal: spacing.lg,
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
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: spacing.lg,
    },
    successCard: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    successIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
        borderWidth: 2,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    successText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: spacing.lg,
    },
});
