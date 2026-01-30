import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
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
            <>
                <SafeAreaView style={{ flex: 0, backgroundColor: colors.success }} />
                <StatusBar barStyle="light-content" />
                <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
                    <LinearGradient
                        colors={[colors.success, colors.successDark || '#28a745']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.successHeader}
                    >
                        <Text style={styles.successLogoText}>Kbarwilly</Text>
                        <Ionicons name="checkmark-circle" size={64} color="#FFF" style={{ marginTop: spacing.md }} />
                    </LinearGradient>

                    <View style={styles.successContent}>
                        <View style={[styles.successCard, { backgroundColor: colors.background.card, ...shadows.lg }]}>
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
                        </View>
                    </View>
                </View>
            </>
        );
    }

    return (
        <>
            <SafeAreaView style={{ flex: 0, backgroundColor: colors.primary }} />
            <StatusBar barStyle="light-content" />
            <ScrollView
                style={[styles.container, { backgroundColor: colors.background.secondary }]}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
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
                            {t('forgotPasswordTitle')}
                        </Text>
                        <Text style={styles.subtitle}>
                            {t('forgotPasswordSubtitle')}
                        </Text>
                    </View>
                </LinearGradient>

                {/* Form Card */}
                <View style={styles.formContainer}>
                    <View style={[styles.formCard, { backgroundColor: colors.background.card, ...shadows.lg }]}>
                        <View style={styles.form}>
                            <Input
                                label={t('emailLabel')}
                                value={email}
                                onChange={setEmail}
                                placeholder={t('emailPlaceholder')}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                error={error}
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
                    </View>
                </View>
            </ScrollView>
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
        fontSize: 24,
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
        lineHeight: 20,
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
    successHeader: {
        paddingTop: spacing['2xl'],
        paddingBottom: spacing['3xl'],
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    successLogoText: {
        fontSize: 42,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: 1,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    successContent: {
        flex: 1,
        marginTop: -40,
        paddingHorizontal: spacing.lg,
    },
    successCard: {
        borderRadius: 24,
        padding: spacing.xl,
        alignItems: 'center',
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    successText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing.lg,
    },
});
