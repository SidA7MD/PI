import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../src/context/ThemeContext';
import { spacing } from '../../../src/theme';

import { useLanguage } from '../../../src/context/LanguageContext';

export default function AbsenceDetailsScreen() {
    const { id } = useLocalSearchParams();
    const { colors } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
            <Text style={[styles.text, { color: colors.text.primary }]}>
                {t('absenceDetails')} {id}
            </Text>
            <Text style={[styles.subtext, { color: colors.text.secondary }]}>
                {t('pending')}
            </Text>
        </View>
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
