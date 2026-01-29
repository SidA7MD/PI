import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../src/context/ThemeContext';
import { spacing } from '../../../src/theme';

export default function ClassDetailsScreen() {
    const { id } = useLocalSearchParams();
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
            <Text style={[styles.text, { color: colors.text.primary }]}>
                Détails de la Classe {id}
            </Text>
            <Text style={[styles.subtext, { color: colors.text.secondary }]}>
                Liste des élèves et statistiques (à implémenter)
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
