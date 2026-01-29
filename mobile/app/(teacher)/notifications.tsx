import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useNotifications } from '../../src/context/NotificationContext';
import { useTheme } from '../../src/context/ThemeContext';
import { spacing, shadows } from '../../src/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLanguage } from '../../src/context/LanguageContext';

export default function NotificationsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { notifications, markAsRead, markAllAsRead } = useNotifications();
    const { t } = useLanguage();

    const handleNotificationPress = (id: string, read: boolean) => {
        if (!read) {
            markAsRead(id);
        }
        // Navigate or expand if needed
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
             {/* Styled Header matching History/Pointer specs */}
             <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={[styles.header, { paddingTop: insets.top + spacing.lg, paddingBottom: spacing['2xl'] }]}
            >
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                     <Text style={[styles.headerTitle, { color: '#FFF' }]}>
                        {t('notificationsTitle')}
                     </Text>
                      <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>
                        {notifications.filter(n => !n.read).length} {t('unreadNotifications').toLowerCase()}
                    </Text>
                </View>
            </LinearGradient>

            <FlatList
                data={notifications}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={[
                            styles.notificationCard, 
                            { backgroundColor: colors.background.card, borderLeftColor: item.read ? 'transparent' : colors.primary }
                        ]}
                        onPress={() => handleNotificationPress(item._id, item.read)}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: item.read ? colors.background.secondary : colors.primary + '15' }]}>
                             <Ionicons 
                                name={item.read ? "notifications-outline" : "notifications"} 
                                size={24} 
                                color={item.read ? colors.text.tertiary : colors.primary} 
                             />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[
                                styles.cardTitle, 
                                { color: colors.text.primary, fontWeight: item.read ? '600' : '700' }
                            ]}>
                                {item.title}
                            </Text>
                            <Text style={[styles.cardMessage, { color: colors.text.secondary }]}>
                                {item.message}
                            </Text>
                            <Text style={[styles.cardTime, { color: colors.text.tertiary }]}>
                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(item.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                        {!item.read && (
                            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                        )}
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off-outline" size={64} color={colors.text.tertiary} />
                        <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                            {t('noNotifications')}
                        </Text>
                    </View>
                }
            />
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
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: spacing.sm,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    listContent: {
        padding: spacing.lg,
        paddingTop: spacing.xl,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: 20,
        marginBottom: spacing.md,
        ...shadows.sm,
        borderLeftWidth: 4,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    textContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        marginBottom: 2,
    },
    cardMessage: {
        fontSize: 14,
        marginBottom: 4,
    },
    cardTime: {
        fontSize: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: spacing.sm,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing['3xl'],
    },
    emptyText: {
        marginTop: spacing.md,
        fontSize: 16,
    },
});
