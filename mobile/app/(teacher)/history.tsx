import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { EmptyState } from '../../src/components/ui/EmptyState';
import * as teacherService from '../../src/services/teacherService';
import { ClassWithStats } from '../../src/services/teacherService';
import { Absence } from '../../src/types';
import { spacing, shadows } from '../../src/theme';

import { useLanguage } from '../../src/context/LanguageContext';

export default function HistoryScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const { t } = useLanguage();

    const [classes, setClasses] = useState<ClassWithStats[]>([]);
    const [selectedClass, setSelectedClass] = useState<ClassWithStats | null>(null);
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const stats = await teacherService.getTeacherStats();
            setClasses(stats.classes);
            if (stats.classes.length > 0 && !selectedClass) {
                setSelectedClass(stats.classes[0]);
            }
        } catch (error) {
            console.error('Error loading classes:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedClass]);

    const loadAbsences = useCallback(async () => {
        if (!selectedClass) return;
        setLoading(true);
        try {
            const data = await teacherService.getClassAbsences(selectedClass._id);
            setAbsences(data);
        } catch (error) {
            console.error('Error loading absences:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedClass]);

    useFocusEffect(
        useCallback(() => {
            if (selectedClass) {
                loadAbsences();
            } else {
                loadData();
            }
        }, [selectedClass, loadAbsences, loadData])
    );

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            loadAbsences();
        }
    }, [selectedClass]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadAbsences();
    };

    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        });
    };

    const formatTime = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'absent':
                return { color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle', label: t('absent') };
            case 'retard':
                return { color: '#F59E0B', bg: '#FEF3C7', icon: 'time', label: t('late') };
            default:
                return { color: '#10B981', bg: '#D1FAE5', icon: 'checkmark-circle', label: t('present') };
        }
    };

    const groupAbsencesByDate = (absences: Absence[]) => {
        const groups: { [key: string]: Absence[] } = {};
        absences.forEach(a => {
            const dateKey = new Date(a.date).toDateString();
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(a);
        });
        return Object.entries(groups).map(([dateKey, items]) => ({
            date: new Date(dateKey),
            absences: items,
        })).sort((a, b) => b.date.getTime() - a.date.getTime());
    };

    if (loading && classes.length === 0) {
        return <LoadingSpinner fullScreen />;
    }

    const groupedAbsences = groupAbsencesByDate(absences);

    return (
        <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
            {/* Header matching Pointer Style */}
            <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={[styles.header, { paddingTop: insets.top + spacing.lg, paddingBottom: spacing['2xl'] }]}
            >
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                     <Text style={[styles.headerTitle, { color: '#FFF' }]}>
                        {selectedClass?.name || t('selectClass')}
                    </Text>
                     <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>
                        {absences.length} {t('absences').toLowerCase()} {t('total').toLowerCase()}
                    </Text>
                </View>
            </LinearGradient>

            {/* Class Selector - Now below header */}
            <View style={styles.selectorContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={classes}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.classChip,
                                { 
                                    backgroundColor: selectedClass?._id === item._id ? colors.primary : colors.background.card,
                                    borderColor: selectedClass?._id === item._id ? colors.primary : colors.border.light,
                                    borderWidth: 1,
                                    ...shadows.sm
                                },
                            ]}
                            onPress={() => setSelectedClass(item)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.classChipText,
                                { color: selectedClass?._id === item._id ? '#FFF' : colors.text.secondary }
                            ]}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.selectorList}
                />
            </View>

            {/* Absences List */}
            {loading ? (
                <LoadingSpinner />
            ) : (
                <FlatList
                    data={groupedAbsences}
                    keyExtractor={(item) => item.date.toISOString()}
                    renderItem={({ item: group }) => (
                        <View style={styles.dateGroup}>
                            <View style={styles.dateHeader}>
                                <View style={[styles.dateBadge, { backgroundColor: colors.primary + '20' }]}>
                                    <Text style={[styles.dateText, { color: colors.primary }]}>
                                        {formatDate(group.date)}
                                    </Text>
                                </View>
                                <Text style={[styles.countText, { color: colors.text.tertiary }]}>
                                    {group.absences.length} {t('count').toLowerCase()}
                                </Text>
                            </View>
                            {group.absences.map((absence) => {
                                const statusConfig = getStatusConfig(absence.absenceType);
                                const student = typeof absence.student === 'object' ? absence.student : null;
                                return (
                                    <View
                                        key={absence._id}
                                        style={[styles.absenceCard, { backgroundColor: colors.background.card }]}
                                    >
                                        <View style={[styles.statusIndicator, { backgroundColor: statusConfig.bg }]}>
                                            <Ionicons name={statusConfig.icon as any} size={20} color={statusConfig.color} />
                                        </View>
                                        <View style={styles.absenceInfo}>
                                            <Text style={[styles.studentName, { color: colors.text.primary }]}>
                                                {student ? `${student.firstName} ${student.lastName}` : 'Élève inconnu'}
                                            </Text>
                                            <Text style={[styles.absenceTime, { color: colors.text.tertiary }]}>
                                                {formatTime(absence.createdAt)} • {statusConfig.label}
                                            </Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                                            <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>
                                                {statusConfig.label}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <EmptyState
                            icon="calendar"
                            title={t('noHistory')}
                            description={t('noData')}
                        />
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                        />
                    }
                />
            )}
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
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
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
        textAlign: 'center',
    },
    selectorContainer: {
        paddingBottom: spacing.xl, // Increased padding to match the visual weight
        marginTop: spacing.md, 
    },
    selectorList: {
        paddingHorizontal: spacing.lg,
    },
    classChip: {
        paddingHorizontal: spacing.lg,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: spacing.sm,
        borderWidth: 1,
    },
    classChipSelected: {
        backgroundColor: '#667eea',
        borderColor: '#667eea',
    },
    classChipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    classChipTextSelected: {
        color: '#FFF',
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: spacing['2xl'],
    },
    dateGroup: {
        marginBottom: spacing.lg,
    },
    dateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    dateBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 8,
    },
    dateText: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    countText: {
        fontSize: 12,
    },
    absenceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: 12,
        marginBottom: spacing.sm,
    },
    statusIndicator: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    absenceInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    studentName: {
        fontSize: 15,
        fontWeight: '600',
    },
    absenceTime: {
        fontSize: 12,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
});
