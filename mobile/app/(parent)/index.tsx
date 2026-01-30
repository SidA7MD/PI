import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Avatar } from '../../src/components/ui/Avatar';
import { spacing, shadows } from '../../src/theme';
import * as parentService from '../../src/services/parentService';

export default function ParentHomeScreen() {
    const { user } = useAuth();
    const { colors } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            setError('');
            const data = await parentService.getParentStats();
            setStats(data);
        } catch (err: any) {
            console.error('Error fetching parent stats:', err);
            setError('Impossible de charger les données');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, []);

    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('hello'); // Simplified to generic hello or specific if keys existed
        if (hour < 18) return t('welcome');
        return t('welcome');
    };

    const getGreetingEmoji = () => {
        const hour = new Date().getHours();
        if (hour < 12) return '☀️';
        if (hour < 18) return '👋';
        return '🌙';
    };

    const StatCard = ({ icon, value, label, color, onPress }: any) => (
        <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: colors.background.card }]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress}
        >
            <View style={[styles.statContent]}>
                <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <View>
                    <Text style={[styles.statValue, { color: colors.text.primary }]}>{value}</Text>
                    <Text style={[styles.statLabel, { color: colors.text.secondary }]}>{label}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const ChildCard = ({ child }: any) => {
        const attendanceRate = child.totalAbsences > 0 
            ? Math.max(0, 100 - (child.totalAbsences / 30 * 100))
            : 100;
        const attendanceColor = attendanceRate >= 90 ? colors.success : attendanceRate >= 75 ? colors.warning : colors.danger;

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/(parent)/absences')}
            >
                <Card style={styles.childCard}>
                    <View style={styles.childHeader}>
                        <Avatar
                            name={`${child.firstName} ${child.lastName}`}
                            size="medium"
                        />
                        <View style={styles.childInfo}>
                            <Text style={[styles.childName, { color: colors.text.primary }]}>
                                {child.firstName} {child.lastName}
                            </Text>
                            {child.class && (
                                <View style={styles.classInfo}>
                                    <Ionicons name="school" size={14} color={colors.primary} />
                                    <Text style={[styles.classText, { color: colors.text.secondary }]}>
                                        {child.class.name} • {child.class.level}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View style={[styles.attendanceBadge, { backgroundColor: attendanceColor + '15' }]}>
                            <Ionicons name="checkmark-circle" size={16} color={attendanceColor} />
                            <Text style={[styles.attendanceText, { color: attendanceColor }]}>
                                {Math.round(attendanceRate)}%
                            </Text>
                        </View>
                    </View>
                    
                    <View style={styles.childFooter}>
                        <View style={styles.childStat}>
                            <Ionicons name="calendar-outline" size={16} color={colors.text.tertiary} />
                            <Text style={[styles.childStatText, { color: colors.text.secondary }]}>
                                {child.totalAbsences} {t('absences').toLowerCase()} {t('total').toLowerCase()}
                            </Text>
                        </View>
                        {child.recentAbsences > 0 && (
                            <View style={[styles.recentBadge, { backgroundColor: colors.danger + '15' }]}>
                                <Ionicons name="alert-circle" size={12} color={colors.danger} />
                                <Text style={[styles.recentText, { color: colors.danger }]}>
                                    {child.recentAbsences} {t('thisWeekCount')}
                                </Text>
                            </View>
                        )}
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: colors.background.secondary }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                    {t('loading')}...
                </Text>
            </View>
        );
    }

    return (
        <>
            <SafeAreaView style={{ flex: 0, backgroundColor: colors.primary }} />
            <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
            <ScrollView 
                contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
            >
                {/* Premium Header */}
                <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.header, { paddingTop: insets.top + spacing.lg }]}
                >
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.greeting}>
                                {getTimeBasedGreeting()} {getGreetingEmoji()}
                            </Text>
                            <Text style={styles.userName}>{user?.username || 'Parent'}</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.profileButton}
                            onPress={() => router.push('/(parent)/profile')}
                        >
                            <LinearGradient
                                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']}
                                style={styles.profileGradient}
                            >
                                <Ionicons name="person" size={20} color="#FFF" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsRow}>
                        <StatCard
                            icon="people"
                            value={stats?.totalChildren || 0}
                            label={t('totalChildren')}
                            color={colors.primary}
                        />
                        <StatCard
                            icon="calendar"
                            value={stats?.totalAbsences || 0}
                            label={t('totalAbsences')}
                            color={colors.danger}
                        />
                    </View>
                    <View style={styles.statsRow}>
                        <StatCard
                            icon="time"
                            value={stats?.recentAbsences || 0}
                            label={t('thisWeek')}
                            color={colors.warning}
                            onPress={() => router.push('/(parent)/absences')}
                        />
                        <StatCard
                            icon="stats-chart"
                            value={stats?.totalChildren ? Math.round((1 - (stats.recentAbsences / (stats.totalChildren * 5))) * 100) + '%' : '100%'}
                            label={t('attendanceRate')}
                            color={colors.success}
                        />
                    </View>
                </View>

                {/* Children Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                                {t('myChildren')}
                            </Text>
                            <Text style={[styles.sectionSubtitle, { color: colors.text.tertiary }]}>
                                {stats?.children?.length || 0} {t('totalChildren')}
                            </Text>
                        </View>
                        <TouchableOpacity 
                            style={[styles.addButton, { backgroundColor: colors.primary + '15' }]}
                            onPress={() => router.push('/(parent)/link-child')}
                        >
                            <Ionicons name="add" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {error && (
                        <Card style={[styles.errorCard, { backgroundColor: colors.danger + '10' }]}>
                            <Ionicons name="alert-circle" size={20} color={colors.danger} />
                            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
                        </Card>
                    )}

                    {stats?.children && stats.children.length > 0 ? (
                        stats.children.map((child: any) => (
                            <ChildCard key={child.id} child={child} />
                        ))
                    ) : (
                        <Card style={styles.emptyCard}>
                            <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '10' }]}>
                                <Ionicons name="people-outline" size={48} color={colors.primary} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                                {t('noChildrenLinked')}
                            </Text>
                            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                                {t('startLinking')}
                            </Text>
                            <Button
                                title={t('linkFirstChild')}
                                onPress={() => router.push('/(parent)/link-child')}
                                style={styles.emptyButton}
                                icon={<Ionicons name="link" size={20} color="#FFF" />}
                            />
                        </Card>
                    )}
                </View>

                {/* Quick Actions */}
                {stats?.children && stats.children.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                            {t('quickActions')}
                        </Text>
                        <View style={styles.quickActionsGrid}>
                            <TouchableOpacity 
                                style={[styles.quickActionCard, { backgroundColor: colors.background.card }]}
                                onPress={() => router.push('/(parent)/absences')}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.quickActionContent]}>
                                    <View style={[styles.quickActionIcon, { backgroundColor: colors.danger + '15' }]}>
                                        <Ionicons name="calendar" size={24} color={colors.danger} />
                                    </View>
                                    <View>
                                        <Text style={[styles.quickActionTitle, { color: colors.text.primary }]}>{t('absences')}</Text>
                                        <Text style={[styles.quickActionDesc, { color: colors.text.secondary }]}>{t('viewHistory')}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.quickActionCard, { backgroundColor: colors.background.card }]}
                                onPress={() => router.push('/(parent)/link-child')}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.quickActionContent]}>
                                    <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '15' }]}>
                                        <Ionicons name="person-add" size={24} color={colors.primary} />
                                    </View>
                                    <View>
                                        <Text style={[styles.quickActionTitle, { color: colors.text.primary }]}>{t('linkChild')}</Text>
                                        <Text style={[styles.quickActionDesc, { color: colors.text.secondary }]}>{t('addNew')}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: 16,
    },
    header: {
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.xl,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 4,
    },
    userName: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFF',
    },
    profileButton: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    profileGradient: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    statsContainer: {
        paddingHorizontal: spacing.lg,
        marginTop: -28,
        marginBottom: spacing.md,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    statCard: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        ...shadows.md,
    },
    statContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
    },
    statIconContainer: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 0,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    section: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 2,
    },
    sectionSubtitle: {
        fontSize: 13,
        fontWeight: '500',
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    childCard: {
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderRadius: 20,
    },
    childHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    childInfo: {
        flex: 1,
        marginLeft: spacing.md,
        justifyContent: 'center',
    },
    childName: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    classInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    classText: {
        fontSize: 14,
        fontWeight: '500',
    },
    attendanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    attendanceText: {
        fontSize: 14,
        fontWeight: '700',
    },
    childFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    childStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    childStatText: {
        fontSize: 13,
        fontWeight: '500',
    },
    recentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    recentText: {
        fontSize: 11,
        fontWeight: '600',
    },
    emptyCard: {
        padding: spacing.xl * 1.5,
        alignItems: 'center',
        borderRadius: 20,
    },
    emptyIcon: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: spacing.sm,
    },
    emptyButton: {
        marginTop: spacing.md,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    quickActionCard: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        ...shadows.md,
    },
    quickActionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
        minHeight: 80,
    },
    quickActionIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    quickActionDesc: {
        fontSize: 12,
        fontWeight: '500',
    },
    errorCard: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: 16,
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    errorText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
});