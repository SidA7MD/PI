import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { Card } from '../../src/components/ui/Card';
import { Avatar } from '../../src/components/ui/Avatar';
import { spacing, shadows } from '../../src/theme';
import * as parentService from '../../src/services/parentService';
import { useLanguage } from '../../src/context/LanguageContext';

const AbsencesScreen = () => {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const insets = useSafeAreaInsets();

    const [absences, setAbsences] = useState<any[]>([]);
    const [children, setChildren] = useState<any[]>([]);
    const [selectedChild, setSelectedChild] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            setError('');
            const [absencesData, childrenData] = await Promise.all([
                parentService.getAbsences(),
                parentService.getChildren(),
            ]);
            setAbsences(absencesData.absences || []);
            setChildren(childrenData.students || []);
        } catch (err: any) {
            console.error('Error fetching absences:', err);
            setError(t('errorOccurred'));
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

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'absent':
                return colors.danger;
            case 'retard':
            case 'late':
                return colors.warning;
            case 'justifié':
            case 'justified':
                return colors.info;
            default:
                return colors.text.secondary;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'absent':
                return 'close-circle';
            case 'retard':
            case 'late':
                return 'time';
            case 'justifié':
            case 'justified':
                return 'checkmark-circle';
            default:
                return 'alert-circle';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const filteredAbsences = selectedChild
        ? absences.filter(abs => abs.student?._id === selectedChild)
        : absences;

    // Group absences by child
    const absencesByChild = filteredAbsences.reduce((acc: any, absence: any) => {
        const studentId = absence.student?._id || 'unknown';
        if (!acc[studentId]) {
            acc[studentId] = {
                student: absence.student,
                absences: [],
            };
        }
        acc[studentId].absences.push(absence);
        return acc;
    }, {});

    const FilterChip = ({ label, value, active }: any) => (
        <TouchableOpacity
            style={[
                styles.filterChip,
                { 
                    backgroundColor: active ? colors.primary : colors.background.card,
                    borderColor: active ? colors.primary : colors.border.light,
                }
            ]}
            onPress={() => setSelectedChild(value)}
            activeOpacity={0.7}
        >
            <Text style={[
                styles.filterChipText,
                { color: active ? '#FFF' : colors.text.primary }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const AbsenceCard = ({ absence }: any) => {
        const statusColor = getStatusColor(absence.status);
        const statusIcon = getStatusIcon(absence.status);

        return (
            <Card style={styles.absenceCard}>
                <View style={styles.absenceHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                        <Ionicons name={statusIcon} size={16} color={statusColor} />
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {absence.status || 'Absent'}
                        </Text>
                    </View>
                    <Text style={[styles.dateText, { color: colors.text.tertiary }]}>
                        {formatDate(absence.date)}
                    </Text>
                </View>

                {absence.class && (
                    <View style={styles.absenceInfo}>
                        <Ionicons name="school-outline" size={16} color={colors.text.tertiary} />
                        <Text style={[styles.infoText, { color: colors.text.secondary }]}>
                            {absence.class.name}
                        </Text>
                    </View>
                )}

                {absence.teacher && (
                    <View style={styles.absenceInfo}>
                        <Ionicons name="person-outline" size={16} color={colors.text.tertiary} />
                        <Text style={[styles.infoText, { color: colors.text.secondary }]}>
                            Enseignant: {absence.teacher.username}
                        </Text>
                    </View>
                )}

                {absence.reason && (
                    <View style={styles.absenceInfo}>
                        <Ionicons name="information-circle-outline" size={16} color={colors.text.tertiary} />
                        <Text style={[styles.infoText, { color: colors.text.secondary }]}>
                            {absence.reason}
                        </Text>
                    </View>
                )}
            </Card>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: colors.background.secondary }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                    {t('loadingData')}
                </Text>
            </View>
        );
    }

    return (
        <>
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
                    style={[styles.header, { paddingTop: insets.top + spacing.lg, paddingBottom: spacing['2xl'] }]}
                >
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={styles.headerTitle}>{t('absences')}</Text>
                        <Text style={styles.headerSubtitle}>
                            {filteredAbsences.length} {filteredAbsences.length !== 1 ? t('absences').toLowerCase() : t('absences').toLowerCase()}
                        </Text>
                    </View>
                </LinearGradient>

                {/* Filters */}
                <View style={styles.filtersContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filtersContent}
                    >
                        <FilterChip
                            label={t('myChildren')}
                            value={null}
                            active={selectedChild === null}
                        />
                        {children.map((child: any) => (
                            <FilterChip
                                key={child._id}
                                label={`${child.firstName} ${child.lastName}`}
                                value={child._id}
                                active={selectedChild === child._id}
                            />
                        ))}
                    </ScrollView>
                </View>

                {/* Absences List */}
                <View style={styles.content}>
                    {error && (
                        <Card style={styles.errorCard}>
                            <View style={[{ backgroundColor: colors.danger + '10' }, { flex: 1, flexDirection: 'row', padding: spacing.md, borderRadius: 12, gap: spacing.sm }]}>
                                <Ionicons name="alert-circle" size={20} color={colors.danger} />
                                <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
                            </View>
                        </Card>
                    )}

                    {filteredAbsences.length === 0 ? (
                        <Card style={styles.emptyCard}>
                            <Ionicons name="checkmark-circle-outline" size={64} color={colors.success} />
                            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                                {t('noAbsences')}
                            </Text>
                            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                                {selectedChild
                                    ? 'Cet enfant n\'a aucune absence enregistrée'
                                    : 'Tous vos enfants sont présents'}
                            </Text>
                        </Card>
                    ) : selectedChild ? (
                        // Show absences for selected child
                        filteredAbsences.map((absence: any) => (
                            <AbsenceCard key={absence._id} absence={absence} />
                        ))
                    ) : (
                        // Group by child when no filter
                        Object.values(absencesByChild).map((group: any) => (
                            <View key={group.student?._id || 'unknown'} style={styles.childGroup}>
                                <View style={styles.childGroupHeader}>
                                    <Avatar
                                        name={`${group.student?.firstName} ${group.student?.lastName}`}
                                        size="small"
                                    />
                                    <Text style={[styles.childGroupName, { color: colors.text.primary }]}>
                                        {group.student?.firstName} {group.student?.lastName}
                                    </Text>
                                    <View style={[styles.countBadge, { backgroundColor: colors.primary + '20' }]}>
                                        <Text style={[styles.countText, { color: colors.primary }]}>
                                            {group.absences.length}
                                        </Text>
                                    </View>
                                </View>
                                {group.absences.map((absence: any) => (
                                    <AbsenceCard key={absence._id} absence={absence} />
                                ))}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
        </>
    );
};

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
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 4,
        color: 'rgba(255,255,255,0.8)',
    },
    filtersContainer: {
        marginTop: spacing.md,
        marginBottom: spacing.md,
    },
    filtersContent: {
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
    },
    filterChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '500',
    },
    content: {
        paddingHorizontal: spacing.lg,
    },
    childGroup: {
        marginBottom: spacing.xl,
    },
    childGroupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    childGroupName: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
    },
    countBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 12,
        minWidth: 28,
        alignItems: 'center',
    },
    countText: {
        fontSize: 12,
        fontWeight: '700',
    },
    absenceCard: {
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderRadius: 12,
    },
    absenceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    dateText: {
        fontSize: 12,
    },
    absenceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: spacing.xs,
    },
    infoText: {
        fontSize: 13,
        flex: 1,
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

export default AbsencesScreen;