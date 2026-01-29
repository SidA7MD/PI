import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { Button } from '../../src/components/ui/Button';
import { spacing, shadows } from '../../src/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as teacherService from '../../src/services/teacherService';
import { TeacherStats } from '../../src/services/teacherService';

// ... (Rest of component logic remains same until styles)

export default function TeacherHomeScreen() {
    const { user, logout } = useAuth();
    const { colors } = useTheme();
    const router = useRouter();
    const { t } = useLanguage();
    const insets = useSafeAreaInsets();
    const [stats, setStats] = useState<TeacherStats | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await teacherService.getTeacherStats();
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStats();
        setRefreshing(false);
    };

    const StatCard = ({ label, value, icon, color }: { label: string; value: string | number; icon: any; color: string }) => (
        <View style={[styles.statCard, { backgroundColor: colors.background.card }]}>
            <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>{label}</Text>
        </View>
    );

    const ActionButton = ({ title, subtitle, icon, onPress, color }: { title: string, subtitle: string, icon: any, onPress: () => void, color: string }) => (
        <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.background.card }]} 
            onPress={onPress}
            activeOpacity={0.7}
        >
             <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={28} color={color} />
             </View>
             <View style={styles.actionInfo}>
                <Text style={[styles.actionTitle, { color: colors.text.primary }]}>{title}</Text>
                <Text style={[styles.actionSubtitle, { color: colors.text.secondary }]}>{subtitle}</Text>
             </View>
             <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
            <ScrollView 
                contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {/* Header using Theme Colors */}
                <View style={styles.headerContainer}>
                    <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.gradientHeader, { paddingTop: insets.top + spacing.lg }]}
                    >
                        <View style={styles.headerContent}>
                            <View>
                                <Text style={styles.welcomeLabel}>{t('hello')},</Text>
                                <Text style={styles.userName}>{user?.username || t('hello')}</Text>
                            </View>
                            <TouchableOpacity 
                                style={styles.profileButton}
                                onPress={() => router.push('/(teacher)/profile')}
                            >
                                <Text style={styles.profileInitials}>
                                    {user?.username?.[0]?.toUpperCase() || 'P'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Real Stats Row */}
                        <View style={styles.statsRow}>
                            <View style={styles.headerStat}>
                                <Text style={styles.headerStatValue}>{stats?.totalClasses || 0}</Text>
                                <Text style={styles.headerStatLabel}>{t('classes')}</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.headerStat}>
                                <Text style={styles.headerStatValue}>{stats?.totalStudents || 0}</Text>
                                <Text style={styles.headerStatLabel}>{t('students')}</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.headerStat}>
                                <Text style={styles.headerStatValue}>{stats?.todayStats?.absences || 0}</Text>
                                <Text style={styles.headerStatLabel}>{t('absences')} (24h)</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>
                
                <View style={styles.content}>
                    <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                        {t('home')}
                    </Text>

                    <View style={styles.actionsGrid}>
                        <ActionButton 
                            title={t('markAttendance')} 
                            subtitle="Marquer les absences"
                            icon="checkbox-outline" 
                            color={colors.success}
                            onPress={() => router.push('/(teacher)/mark-absence')}
                        />
                         <ActionButton 
                            title={t('history')} 
                            subtitle="Consulter les relevés"
                            icon="calendar-outline" 
                            color={colors.warning}
                            onPress={() => router.push('/(teacher)/history')}
                        />
                         <ActionButton 
                            title={t('notifications')} 
                            subtitle="Consulter les notifications"
                            icon="notifications-outline" 
                            color={colors.info || '#3B82F6'}
                            onPress={() => router.push('/(teacher)/notifications')}
                        />
                         {/* Removed "Mes Classes" as requested to focus on Pointer */}
                    </View>

                    <Button
                        title={t('logout')}
                        onPress={logout}
                        variant="danger-outline"
                        style={{ marginTop: spacing.xl, borderColor: 'transparent' }}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        overflow: 'hidden',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    gradientHeader: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    welcomeLabel: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    userName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFF',
    },
    profileButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    profileInitials: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        padding: spacing.md,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    headerStat: {
        alignItems: 'center',
    },
    headerStatValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
    },
    headerStatLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    content: {
        padding: spacing.lg,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: spacing.md,
    },
    actionsGrid: {
        gap: spacing.md,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: 20,
        ...shadows.md, // Use theme shadow
    },
    actionIcon: {
        width: 50,
        height: 50,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    actionTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    actionSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    statCard: {
        padding: spacing.md,
        borderRadius: 16,
        alignItems: 'center',
        width: '31%',
    },
    statIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 12,
    },
});