import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { spacing } from '../../src/theme';
import * as parentService from '../../src/services/parentService';
import { useLanguage } from '../../src/context/LanguageContext';


import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background.secondary }]}
            contentContainerStyle={styles.content}
        >
            <View style={[styles.header, { paddingTop: insets.top + spacing.xl }]}>
                <Ionicons name="link" size={64} color={colors.primary} />
                <Text style={[styles.title, { color: colors.text.primary }]}>
                    {t('enterChildCode')}
                </Text>
                <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                    {t('codeProvided')}
                </Text>
            </View>

            <Card style={styles.form}>
                <Input
                    value={uniqueCode}
                    onChange={setUniqueCode}
                    placeholder="Ex: ABC123XYZ"
                    autoCapitalize="characters"
                    maxLength={10}
                    large
                    centered
                    error={error}
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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
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
        padding: spacing.lg,
    },
});
