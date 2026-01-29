import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { spacing } from '../../src/theme';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { colors } = useTheme();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleResetPassword = async () => {
        setError('');

        if (!email) {
            setError('Veuillez entrer votre email');
            return;
        }

        setLoading(true);
        try {
            // TODO: Implement forgot password API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSuccess(true);
        } catch (err: any) {
            setError('Erreur lors de l\'envoi de l\'email');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
                <View style={styles.successContainer}>
                    <Ionicons name="checkmark-circle" size={80} color={colors.success} />
                    <Text style={[styles.successTitle, { color: colors.text.primary }]}>
                        Email envoyé !
                    </Text>
                    <Text style={[styles.successText, { color: colors.text.secondary }]}>
                        Consultez votre boîte email pour réinitialiser votre mot de passe.
                    </Text>
                    <Button
                        title="Retour à la connexion"
                        onPress={() => router.back()}
                        fullWidth
                        style={{ marginTop: spacing.xl }}
                    />
                </View>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background.primary }]}
            contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.header}>
                <Ionicons name="lock-closed" size={48} color={colors.primary} />
                <Text style={[styles.title, { color: colors.text.primary }]}>
                    Mot de passe oublié ?
                </Text>
                <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                    Entrez votre email pour recevoir un lien de réinitialisation
                </Text>
            </View>

            <View style={styles.form}>
                <Input
                    label="Email"
                    value={email}
                    onChange={setEmail}
                    placeholder="votre@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={error}
                />

                <Button
                    title="Envoyer le lien"
                    onPress={handleResetPassword}
                    loading={loading}
                    fullWidth
                    style={{ marginTop: spacing.xl }}
                />

                <Button
                    title="Retour"
                    onPress={() => router.back()}
                    variant="ghost"
                    fullWidth
                    style={{ marginTop: spacing.md }}
                />
            </View>
        </ScrollView>
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
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: spacing.md,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        marginTop: spacing.sm,
        textAlign: 'center',
        lineHeight: 20,
    },
    form: {
        width: '100%',
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: spacing.lg,
    },
    successText: {
        fontSize: 16,
        marginTop: spacing.md,
        textAlign: 'center',
        lineHeight: 22,
    },
});
