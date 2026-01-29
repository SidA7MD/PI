import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { spacing } from '../../src/theme';
import { useLanguage } from '../../src/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
             {/* Styled Header matching Teacher Style */}
             <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={[styles.header, { paddingTop: insets.top + spacing.lg, paddingBottom: spacing['2xl'] }]}
            >
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                     <Text style={[styles.headerTitle, { color: '#FFF' }]}>
                        {t('notifications')}
                     </Text>
                      <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>
                        0 {t('unreadNotifications').toLowerCase()}
                    </Text>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.emptyState}>
                    <Ionicons name="notifications-off-outline" size={64} color={colors.text.tertiary} />
                    <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                        {t('noNotifications')}
                    </Text>
                    <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                        Vous n'avez aucune nouvelle notification pour le moment.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: spacing.xl,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -spacing['3xl'], // Offset header
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginHorizontal: spacing.lg,
    },
});
