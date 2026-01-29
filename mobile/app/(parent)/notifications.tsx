import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { spacing } from '../../src/theme';
import { useLanguage } from '../../src/context/LanguageContext';

export default function NotificationsScreen() {
    const { colors } = useTheme();
    const { t } = useLanguage();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background.secondary }]}>
            <Text style={[styles.text, { color: colors.text.primary }]}>
                {t('notificationsTitle')} - {t('pending')}
            </Text>
            <Text style={[styles.subtext, { color: colors.text.secondary }]}>
                {t('noNotifications')}
            </Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    text: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    subtext: {
        fontSize: 14,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
});
