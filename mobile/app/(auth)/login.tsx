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
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: colors.background.primary }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Ionicons name="school" size={64} color={colors.primary} />
                    <Text style={[styles.title, { color: colors.text.primary }]}>
                        {t('appName')}
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                        {t('appSubtitle')}
                    </Text>
                </View>

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
        justifyContent: 'center',
        padding: spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing['2xl'],
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginTop: spacing.md,
    },
    subtitle: {
        fontSize: 16,
        marginTop: spacing.xs,
    },
    form: {
        width: '100%',
    },
});
