import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { spacing, shadows } from '../../src/theme';
import * as parentService from '../../src/services/parentService';
import { useLanguage } from '../../src/context/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function LinkChildScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { t } = useLanguage();
    const insets = useSafeAreaInsets();

    const [uniqueCode, setUniqueCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLinkChild = async () => {
        setError('');

        if (!uniqueCode || uniqueCode.length < 6) {
            setError(t('invalidCode'));
            return;
        }

        setLoading(true);
        try {
            await parentService.linkChild(uniqueCode);
            router.back();
        } catch (err: any) {
            setError(err.response?.data?.message || t('invalidCode'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Premium Gradient Header */}
                    <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.header, { paddingTop: insets.top + spacing.lg }]}
                    >
                        <View style={styles.headerContent}>
                            <Text style={styles.title}>
                                {t('enterChildCode')}
                            </Text>
                            <Text style={styles.subtitle}>
                                {t('codeProvided')}
                            </Text>
                        </View>
                    </LinearGradient>

                    {/* Floating Form Card */}
                    <View style={styles.formContainer}>
                        <Card style={{ ...styles.formCard, backgroundColor: colors.background.card }}>
                            <Input
                                label={t('childCodeLabel') || "Code élève"}
                                value={uniqueCode}
                                onChange={setUniqueCode}
                                placeholder="Ex: ABC123XYZ"
                                autoCapitalize="characters"
                                maxLength={10}
                                large
                                centered
                                error={error}
                                inputStyle={{ letterSpacing: 6, fontWeight: '700', fontSize: 24 }}
                            />

                            <Button
                                title={t('linkButton')}
                                onPress={handleLinkChild}
                                loading={loading}
                                disabled={uniqueCode.length < 6}
                                fullWidth
                                style={{ marginTop: spacing.xl }}
                            />

                            <Button
                                title={t('cancel')}
                                onPress={() => router.back()}
                                variant="ghost"
                                fullWidth
                                style={{ marginTop: spacing.md }}
                            />
                        </Card>

                        {/* Help Section */}
                        <View style={styles.helpContainer}>
                            <Ionicons name="information-circle-outline" size={20} color={colors.text.tertiary} />
                            <Text style={[styles.helpText, { color: colors.text.secondary }]}>
                                {t('askTags') || "Demandez ce code à l'administration de l'école"}
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
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
        paddingBottom: spacing['2xl'],
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        zIndex: 10,
        alignItems: 'center',
    },
    headerContent: {
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center',
    },
    iconContainer: {
        display: 'none', // Hide icon to match other screens
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginTop: 4,
        maxWidth: '90%',
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
    },
    formCard: {
        padding: spacing.xl,
        borderRadius: 24,
        ...shadows.lg,
    },
    helpContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.xl,
        gap: spacing.sm,
        paddingHorizontal: spacing.xl,
    },
    helpText: {
        fontSize: 14,
        textAlign: 'center',
        flex: 1,
    },
});
