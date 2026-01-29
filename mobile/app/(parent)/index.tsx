import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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

    const StatCard = ({ icon, value, label, color, onPress }: any) => (
        <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: colors.background.card }]} 
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>{label}</Text>
        </TouchableOpacity>
    );

    const ChildCard = ({ child }: any) => (
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
                            <Ionicons name="school-outline" size={14} color={colors.text.tertiary} />
                            <Text style={[styles.classText, { color: colors.text.secondary }]}>
                                {child.class.name} - {child.class.level}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
            
            <View style={styles.childStats}>
                <View style={styles.childStat}>
                    <Ionicons name="calendar-outline" size={16} color={colors.warning} />
                    <Text style={[styles.childStatText, { color: colors.text.secondary }]}>
                        {child.totalAbsences} absence{child.totalAbsences !== 1 ? 's' : ''}
                    </Text>
                </View>
                {child.recentAbsences > 0 && (
                    <View style={[styles.badge, { backgroundColor: colors.warning + '20' }]}>
                        <Text style={[styles.badgeText, { color: colors.warning }]}>
                            {child.recentAbsences} cette semaine
                        </Text>
                    </View>
                )}
            </View>
        </Card>
    );

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
        <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background.secondary }]}>
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
                    style={[styles.header, { paddingTop: spacing.lg }]}
                >
                    <Text style={styles.greeting}>{t('welcome')}, {user?.username}! 👋</Text>
                    <Text style={styles.subtitle}>{t('childrenDashboard')}</Text>
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
                            value={stats?.totalChildren ? Math.round((1 - (stats.recentAbsences / (stats.totalChildren * 5))) * 100) : 100}
                            label={t('attendanceRate')}
                            color={colors.success}
                        />
                    </View>
                </View>

                {/* Children Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                            {t('myChildren')}
                        </Text>
                        <TouchableOpacity onPress={() => router.push('/(parent)/link-child')}>
                            <View style={styles.addButton}>
                                <Ionicons name="add-circle" size={24} color={colors.primary} />
                            </View>
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
                            <Ionicons name="people-outline" size={48} color={colors.text.tertiary} />
                            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                                {t('noChildren')}
                            </Text>
                            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                                Demandez le code unique à l'école de votre enfant pour le lier à votre compte
                            </Text>
                            <Button
                                title="Lier un enfant"
                                onPress={() => router.push('/(parent)/link-child')}
                                style={{ marginTop: spacing.md }}
                                icon={<Ionicons name="link" size={20} color="#FFF" />}
                            />
                        </Card>
                    )}
                </View>

                {/* Quick Actions */}
                {stats?.children && stats.children.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                            Actions rapides
                        </Text>
                        <Card style={styles.quickActions}>
                            <TouchableOpacity 
                                style={styles.quickAction}
                                onPress={() => router.push('/(parent)/absences')}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: colors.warning + '15' }]}>
                                    <Ionicons name="calendar" size={24} color={colors.warning} />
                                </View>
                                <Text style={[styles.quickActionText, { color: colors.text.primary }]}>
                                    Voir les absences
                                </Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                            </TouchableOpacity>
                            
                            <View style={[styles.divider, { backgroundColor: colors.border.light }]} />
                            
                            <TouchableOpacity 
                                style={styles.quickAction}
                                onPress={() => router.push('/(parent)/link-child')}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '15' }]}>
                                    <Ionicons name="person-add" size={24} color={colors.primary} />
                                </View>
                                <Text style={[styles.quickActionText, { color: colors.text.primary }]}>
                                  {t('addChild')}
                            </Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                            </TouchableOpacity>
                        </Card>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
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
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    greeting: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
    },
    statsContainer: {
        paddingHorizontal: spacing.lg,
        marginTop: -spacing.xl,
        marginBottom: spacing.md,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    statCard: {
        flex: 1,
        padding: spacing.lg,
        borderRadius: 16,
        alignItems: 'center',
        ...shadows.md,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    section: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    addButton: {
        padding: spacing.xs,
    },
    childCard: {
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderRadius: 16,
    },
    childHeader: {
        flexDirection: 'row',
        marginBottom: spacing.md,
    },
    childInfo: {
        flex: 1,
        marginLeft: spacing.md,
        justifyContent: 'center',
    },
    childName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    classInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    classText: {
        fontSize: 14,
    },
    childStats: {
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
        fontSize: 14,
    },
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyCard: {
        padding: spacing.xl,
        alignItems: 'center',
        borderRadius: 16,
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
    },
    quickActions: {
        padding: 0,
        overflow: 'hidden',
        borderRadius: 16,
    },
    quickAction: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    quickActionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        marginHorizontal: spacing.lg,
    },
    errorCard: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: 12,
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    errorText: {
        flex: 1,
        fontSize: 14,
    },
});