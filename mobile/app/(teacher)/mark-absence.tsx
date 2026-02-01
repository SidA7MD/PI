import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../src/context/LanguageContext';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { Button } from '../../src/components/ui/Button';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import * as teacherService from '../../src/services/teacherService';
import { ClassWithStats } from '../../src/services/teacherService';
import { Student } from '../../src/types';
import { spacing, borderRadius, shadows } from '../../src/theme';

type AbsenceStatus = 'présent' | 'absent' | 'retard';

interface StudentWithStatus extends Student {
    status: AbsenceStatus;
}

export default function MarkAbsenceScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ classId?: string; className?: string }>();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const { t } = useLanguage();

    const [classes, setClasses] = useState<ClassWithStats[]>([]);
    const [selectedClass, setSelectedClass] = useState<ClassWithStats | null>(null);
    const [students, setStudents] = useState<StudentWithStatus[]>([]);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [startTime, setStartTime] = useState<string>('08:00');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const START_TIMES = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];


    useEffect(() => {
        loadClasses();
    }, []);

    useEffect(() => {
        if (params.classId && classes.length > 0) {
            const cls = classes.find(c => c._id === params.classId);
            if (cls) {
                handleSelectClass(cls);
            }
        }
    }, [params.classId, classes]);

    const loadClasses = async () => {
        try {
            const stats = await teacherService.getTeacherStats();
            setClasses(stats.classes);
            if (stats.subjects && stats.subjects.length > 0) {
                setSubjects(stats.subjects);
                setSelectedSubject(stats.subjects[0]);
            }
        } catch (error) {
            console.error('Error loading classes:', error);
            Alert.alert(t('error'), t('errorOccurred'));
        } finally {
            setLoading(false);
        }
    };

    const handleSelectClass = async (cls: ClassWithStats) => {
        setSelectedClass(cls);
        setLoading(true);
        try {
            const data = await teacherService.getClassStudents(cls._id);
            setStudents(data.map(s => ({ ...s, status: 'présent' as AbsenceStatus })));
        } catch (error) {
            console.error('Error loading students:', error);
            Alert.alert(t('error'), t('errorOccurred'));
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId: string, status: AbsenceStatus) => {
        setStudents(prev => prev.map(s =>
            s._id === studentId ? { ...s, status } : s
        ));
    };

    const markAllAs = (status: AbsenceStatus) => {
        setStudents(prev => prev.map(s => ({ ...s, status })));
    };

    const getStatusCounts = () => {
        return {
            présent: students.filter(s => s.status === 'présent').length,
            absent: students.filter(s => s.status === 'absent').length,
            retard: students.filter(s => s.status === 'retard').length,
        };
    };

    const handleSubmit = async () => {
        if (!selectedClass || !selectedClass._id) {
             Alert.alert(t('error'), 'Veuillez sélectionner une classe');
             return;
        }

        const absencesToMark = students.filter(s => s.status !== 'présent');
        const counts = getStatusCounts();

        if (students.length === 0) {
            Alert.alert(t('error'), 'Aucun élève dans cette classe');
            return;
        }
        
        // Log for debugging
        console.log('Preparation submission:', {
            classId: selectedClass._id,
            studentsCount: students.length,
            absencesToMark: absencesToMark.length,
            subject: selectedSubject,
            startTime
        });

        if (absencesToMark.length === 0) {
           Alert.alert(
                t('confirm'),
                t('allPresent') + '?',
                [
                    { text: t('cancel'), style: 'cancel' },
                    { 
                        text: t('confirm'), 
                        onPress: () => submitData()
                    }
                ]
            );
            return;
        }

        Alert.alert(
            t('confirm'),
            `${counts.absent} ${t('absent')}, ${counts.retard} ${t('late')}. ` + t('confirm') + '?',
            [
                { text: t('cancel'), style: 'cancel' },
                { text: t('confirm'), onPress: () => submitData() }
            ]
        );
    };

    const submitData = async () => {
        if (!selectedClass || !selectedClass._id) return;
        setSubmitting(true);
        try {
            const payload = {
                classId: selectedClass._id,
                students: students.map(s => ({
                    studentId: s._id,
                    status: s.status,
                })),
                subject: selectedSubject,
                startTime: startTime
            };
            console.log('Sending payload:', JSON.stringify(payload));

            await teacherService.markBulkAbsence(payload);
            
             const counts = getStatusCounts();
             Alert.alert(
                t('success'),
                t('success'),
                [{ text: 'OK', onPress: () => router.back() }]
            );

        } catch (error: any) {
            console.error('Error marking absences:', error);
            Alert.alert('Erreur', error.response?.data?.message || 'Impossible d\'enregistrer les absences');
        } finally {
            setSubmitting(false);
        }
    }

    const getStatusColor = (status: AbsenceStatus) => {
        switch (status) {
            case 'présent': return colors.success;
            case 'absent': return colors.danger;
            case 'retard': return colors.warning;
            default: return colors.border.light;
        }
    };

    if (loading && classes.length === 0) {
        return <LoadingSpinner fullScreen />;
    }

    // --- Class Selection View (Focus on Pointer) ---
    if (!selectedClass) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
                <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={[styles.headerGradient, { paddingTop: insets.top + spacing.lg }]}
                >
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                         <Text style={styles.headerTitleText}>{t('selectClass')}</Text>
                         <Text style={styles.headerSubtitleText}>
                            {t('selectClass')}
                         </Text>
                    </View>
                </LinearGradient>

                <FlatList
                    data={classes}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.classCard, { backgroundColor: colors.background.card }]}
                            onPress={() => handleSelectClass(item)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.classIconConfig, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name="people" size={24} color={colors.primary} />
                            </View>
                            <View style={styles.classInfo}>
                                <Text style={[styles.className, { color: colors.text.primary }]}>
                                    {item.name}
                                </Text>
                                <Text style={[styles.classDetails, { color: colors.text.secondary }]}>
                                    {item.studentCount} {t('students').toLowerCase()} • {item.level || ''}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                             <Ionicons name="school-outline" size={64} color={colors.text.tertiary} />
                            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                                {t('noClasses')}
                            </Text>
                        </View>
                    }
                />
            </View>
        );
    }

    // --- Attendance View ---
    const counts = getStatusCounts();

    return (
        <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
            <View
                 style={[styles.attendanceHeader, { paddingTop: insets.top, backgroundColor: colors.background.card }]}
            >
                <View style={styles.attendanceHeaderTop}>
                    <TouchableOpacity
                        onPress={() => setSelectedClass(null)}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <View style={styles.headerClassInfo}>
                        <Text style={[styles.headerClassName, { color: colors.text.primary }]}>
                            {selectedClass.name}
                        </Text>
                        <Text style={[styles.headerClassSub, { color: colors.text.secondary }]}>
                            {students.length} {t('students').toLowerCase()}
                        </Text>
                    </View>
                    <TouchableOpacity
                         onPress={() => markAllAs('présent')}
                         style={[styles.markAllBtn, { backgroundColor: colors.success + '15' }]}
                    >
                         <Text style={[styles.markAllText, { color: colors.success }]}>{t('allPresent')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Status Tabs */}
                <View style={styles.statusTabs}>
                    <View style={[styles.statusTab, { borderColor: colors.success, backgroundColor: colors.success + '10' }]}>
                         <Text style={[styles.statusCount, { color: colors.success }]}>{counts.présent}</Text>
                         <Text style={[styles.statusLabel, { color: colors.success }]}>{t('present')}</Text>
                    </View>
                    <View style={[styles.statusTab, { borderColor: colors.danger, backgroundColor: colors.danger + '10' }]}>
                         <Text style={[styles.statusCount, { color: colors.danger }]}>{counts.absent}</Text>
                         <Text style={[styles.statusLabel, { color: colors.danger }]}>{t('absent')}</Text>
                    </View>
                     <View style={[styles.statusTab, { borderColor: colors.warning, backgroundColor: colors.warning + '10' }]}>
                         <Text style={[styles.statusCount, { color: colors.warning }]}>{counts.retard}</Text>
                         <Text style={[styles.statusLabel, { color: colors.warning }]}>{t('late')}</Text>
                    </View>
                </View>
                </View>

                {/* Subject and Time Selection */}
                <View style={[styles.selectionContainer, { backgroundColor: colors.background.secondary }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t('subject')}</Text>
                    <FlatList
                        horizontal
                        data={subjects}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item}
                        style={styles.horizontalList}
                        contentContainerStyle={styles.horizontalListContent}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.selectionChip,
                                    selectedSubject === item 
                                        ? { backgroundColor: colors.primary, borderColor: colors.primary }
                                        : { backgroundColor: colors.background.card, borderColor: colors.border.light },
                                    { borderWidth: 1 }
                                ]}
                                onPress={() => setSelectedSubject(item)}
                            >
                                <Text style={[
                                    styles.chipText,
                                    selectedSubject === item ? { color: '#FFF' } : { color: colors.text.primary }
                                ]}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />

                    <Text style={[styles.sectionTitle, { color: colors.text.primary, marginTop: spacing.sm }]}>{t('time')}</Text>
                    <FlatList
                        horizontal
                        data={START_TIMES}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item}
                        style={styles.horizontalList}
                        contentContainerStyle={styles.horizontalListContent}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.selectionChip,
                                    startTime === item 
                                        ? { backgroundColor: colors.primary, borderColor: colors.primary }
                                        : { backgroundColor: colors.background.card, borderColor: colors.border.light },
                                    { borderWidth: 1 }
                                ]}
                                onPress={() => setStartTime(item)}
                            >
                                <Text style={[
                                    styles.chipText,
                                    startTime === item ? { color: '#FFF' } : { color: colors.text.primary }
                                ]}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>

            {loading ? (
                <LoadingSpinner />
            ) : (
                <FlatList
                    data={students}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.studentsList}
                    renderItem={({ item }) => (
                        <View style={[
                            styles.studentRow, 
                            { 
                                backgroundColor: colors.background.card,
                                borderColor: item.status !== 'présent' ? getStatusColor(item.status) : 'transparent',
                                borderWidth: 1, 
                            }
                        ]}>
                            <View style={styles.studentMain}>
                                <View style={[styles.avatar, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                                    <Text style={[styles.avatarText, { color: getStatusColor(item.status) }]}>
                                        {item.firstName?.[0]}{item.lastName?.[0]}
                                    </Text>
                                </View>
                                <View style={styles.nameContainer}>
                                    <Text style={[styles.studentName, { color: colors.text.primary }]}>
                                        {item.firstName} {item.lastName}
                                    </Text>
                                    <Text style={[styles.studentStatusText, { color: getStatusColor(item.status) }]}>
                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                    </Text>
                                </View>
                            </View>
                            
                            <View style={styles.actionButtons}>
                                <TouchableOpacity 
                                    onPress={() => handleStatusChange(item._id, 'présent')}
                                    style={[
                                        styles.iconBtn, 
                                        item.status === 'présent' && { backgroundColor: colors.success + '20' }
                                    ]}
                                >
                                     <Ionicons 
                                        name="checkmark-circle" 
                                        size={24} 
                                        color={item.status === 'présent' ? colors.success : colors.text.tertiary} 
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => handleStatusChange(item._id, 'absent')}
                                    style={[
                                        styles.iconBtn,
                                        item.status === 'absent' && { backgroundColor: colors.danger + '20' }
                                    ]}
                                >
                                     <Ionicons 
                                        name="close-circle" 
                                        size={24} 
                                        color={item.status === 'absent' ? colors.danger : colors.text.tertiary} 
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => handleStatusChange(item._id, 'retard')}
                                    style={[
                                        styles.iconBtn,
                                        item.status === 'retard' && { backgroundColor: colors.warning + '20' }
                                    ]}
                                >
                                     <Ionicons 
                                        name="time" 
                                        size={24} 
                                        color={item.status === 'retard' ? colors.warning : colors.text.tertiary} 
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            <View style={[styles.footer, { backgroundColor: colors.background.card, paddingBottom: insets.bottom + spacing.md }]}>
                <Button
                    title={`${t('confirm')} (${counts.absent + counts.retard})`}
                    onPress={handleSubmit}
                    loading={submitting}
                    fullWidth
                    style={{ borderRadius: 12 }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    // Class Select
    headerGradient: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing['2xl'],
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        alignItems: 'center',
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: spacing.md,
    },
    backButtonWhite: {
        position: 'absolute',
        left: 0,
        padding: spacing.xs,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        zIndex: 10,
    },
    headerTitleText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
    },
    headerSubtitleText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
    },
    listContent: {
        padding: spacing.lg,
    },
    classCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: 20,
        marginBottom: spacing.md,
        ...shadows.md, // Use theme shadow
    },
    classIconConfig: {
        width: 50,
        height: 50,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    classInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    className: {
        fontSize: 18,
        fontWeight: '700',
    },
    classDetails: {
        fontSize: 14,
        marginTop: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: spacing['2xl'],
    },
    emptyText: {
        marginTop: spacing.md,
        fontSize: 16,
    },
    // Attendance View
    attendanceHeader: {
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        zIndex: 10,
    },
    attendanceHeaderTop: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    backButton: {
        padding: spacing.xs,
    },
    headerClassInfo: {
        flex: 1,
        alignItems: 'center',
    },
    headerClassName: {
        fontSize: 18,
        fontWeight: '700',
    },
    headerClassSub: {
        fontSize: 12,
    },
    markAllBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    markAllText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusTabs: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        gap: spacing.md,
        marginTop: spacing.sm,
    },
    statusTab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderRadius: 12,
        borderWidth: 1,
    },
    statusCount: {
        fontSize: 18,
        fontWeight: '700',
    },
    statusLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    studentsList: {
        padding: spacing.md,
        paddingBottom: 100,
    },
    studentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderRadius: 16,
        marginBottom: spacing.sm,
        ...shadows.sm, // Use theme shadow
    },
    studentMain: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '700',
    },
    nameContainer: {
        flex: 1,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '600',
    },
    studentStatusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    selectionContainer: {
        paddingVertical: spacing.sm,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: spacing.lg,
        marginBottom: spacing.xs,
    },
    horizontalList: {
        flexGrow: 0,
    },
    horizontalListContent: {
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
        paddingBottom: spacing.sm,
    },
    selectionChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
