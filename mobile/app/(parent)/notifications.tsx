import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { spacing, shadows } from '../../src/theme';
import { useLanguage } from '../../src/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../../src/context/NotificationContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NotificationsScreen() {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const insets = useSafeAreaInsets();
    const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
    const [refreshing, setRefreshing] = React.useState(false);

    useFocusEffect(
        useCallback(() => {
            refreshNotifications();
        }, [refreshNotifications])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshNotifications();
        setRefreshing(false);
    };

    const handleMarkAsRead = (id: string, read: boolean) => {
        if (!read) {
            markAsRead(id);
        }
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'absence': return 'alert-circle';
            case 'late': return 'time';
            case 'info': return 'information-circle';
            default: return 'notifications';
        }
    };

    const getColorForType = (type: string) => {
        switch (type) {
            case 'absence': return colors.danger;
            case 'late': return colors.warning;
            case 'info': return colors.info;
            default: return colors.primary;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
             {/* Styled Header matching Teacher Style */}
             <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={[styles.header, { paddingTop: insets.top + spacing.lg, paddingBottom: spacing['2xl'] }]}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={[styles.headerTitle, { color: '#FFF' }]}>
                            {t('notifications')}
                        </Text>
                        <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>
                            {unreadCount} {t('unreadNotifications').toLowerCase()}
                        </Text>
                    </View>
                    {unreadCount > 0 && (
                        <TouchableOpacity 
                            style={styles.readAllButton}
                            onPress={markAllAsRead}
                        >
                            <Ionicons name="checkmark-done" size={20} color="#FFF" />
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            <ScrollView 
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                {notifications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off-outline" size={64} color={colors.text.tertiary} />
                        <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                            {t('noNotifications')}
                        </Text>
                        <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                            Vous n'avez aucune nouvelle notification pour le moment.
                        </Text>
                    </View>
                ) : (
                    notifications.map((notification) => (
                        <TouchableOpacity
                            key={notification._id}
                            style={[
                                styles.notificationCard,
                                { backgroundColor: colors.background.card },
                                !notification.read && styles.unreadCard
                            ]}
                            onPress={() => handleMarkAsRead(notification._id, notification.read)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.iconContainer, 
                                { backgroundColor: getColorForType(notification.type) + '15' }
                            ]}>
                                <Ionicons 
                                    name={getIconForType(notification.type)} 
                                    size={24} 
                                    color={getColorForType(notification.type)} 
                                />
                            </View>
                            <View style={styles.textContainer}>
                                <View style={styles.topRow}>
                                    <Text style={[styles.notificationTitle, { color: colors.text.primary }]}>
                                        {notification.title}
                                    </Text>
                                    <Text style={[styles.timeText, { color: colors.text.tertiary }]}>
                                        {format(new Date(notification.createdAt), 'dd MMM HH:mm', { locale: fr })}
                                    </Text>
                                </View>
                                <Text style={[styles.notificationMessage, { color: colors.text.secondary }]}>
                                    {notification.message}
                                </Text>
                            </View>
                            {!notification.read && (
                                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                            )}
                        </TouchableOpacity>
                    ))
                )}
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
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    readAllButton: {
        padding: spacing.sm,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    content: {
        padding: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: 100,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing['3xl'],
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
    notificationCard: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: 16,
        marginBottom: spacing.md,
        ...shadows.sm,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    unreadCard: {
        borderColor: 'rgba(59, 130, 246, 0.3)', // light primary color
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    textContainer: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: spacing.sm,
    },
    timeText: {
        fontSize: 12,
    },
    notificationMessage: {
        fontSize: 14,
        lineHeight: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
    },
});
