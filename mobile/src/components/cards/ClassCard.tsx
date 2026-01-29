import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface ClassCardProps {
    className: string;
    level?: string;
    studentCount: number;
    todayAbsences?: number;
    todayLates?: number;
    onPress: () => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
    className,
    level,
    studentCount,
    todayAbsences = 0,
    todayLates = 0,
    onPress,
}) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.background.card }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={styles.nameRow}>
                    <Text style={[styles.className, { color: colors.text.primary }]}>
                        {className}
                    </Text>
                    {level && (
                        <View style={[styles.levelBadge, { backgroundColor: colors.background.tertiary }]}>
                            <Text style={[styles.levelText, { color: colors.text.secondary }]}>
                                {level}
                            </Text>
                        </View>
                    )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </View>

            <View style={styles.footer}>
                <View style={styles.metaRow}>
                    <View style={styles.meta}>
                        <Ionicons name="people-outline" size={16} color={colors.text.tertiary} />
                        <Text style={[styles.metaText, { color: colors.text.secondary }]}>
                            {studentCount} élèves
                        </Text>
                    </View>
                    {todayAbsences > 0 && (
                        <View style={styles.absenceBadge}>
                            <Ionicons name="alert-circle" size={14} color="#EF4444" />
                            <Text style={styles.absenceBadgeText}>
                                {todayAbsences} absent{todayAbsences > 1 ? 's' : ''}
                            </Text>
                        </View>
                    )}
                    {todayLates > 0 && (
                        <View style={styles.lateBadge}>
                            <Ionicons name="time" size={14} color="#F59E0B" />
                            <Text style={styles.lateBadgeText}>
                                {todayLates} retard{todayLates > 1 ? 's' : ''}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

interface StudentCardProps {
    firstName: string;
    lastName: string;
    uniqueCode: string;
    status: 'présent' | 'absent' | 'retard';
    onStatusChange: (status: 'présent' | 'absent' | 'retard') => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
    firstName,
    lastName,
    uniqueCode,
    status,
    onStatusChange,
}) => {
    const { colors } = useTheme();

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'présent': return { bg: '#F0FDF4', border: '#BBF7D0', text: '#10B981' };
            case 'absent': return { bg: '#FEF2F2', border: '#FECACA', text: '#EF4444' };
            case 'retard': return { bg: '#FFFBEB', border: '#FDE68A', text: '#F59E0B' };
            default: return { bg: '#F9FAFB', border: '#E5E7EB', text: '#6B7280' };
        }
    };

    const statusColors = getStatusColor(status);
    const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();

    return (
        <View style={[styles.studentCard, { backgroundColor: colors.background.card }]}>
            <View style={styles.studentInfo}>
                <View style={[
                    styles.avatar,
                    { 
                        backgroundColor: statusColors.bg,
                        borderColor: statusColors.border,
                    }
                ]}>
                    <Text style={[styles.initials, { color: statusColors.text }]}>
                        {initials}
                    </Text>
                </View>
                <View style={styles.studentDetails}>
                    <Text style={[styles.studentName, { color: colors.text.primary }]}>
                        {firstName} {lastName}
                    </Text>
                    <Text style={[styles.studentCode, { color: colors.text.tertiary }]}>
                        {uniqueCode}
                    </Text>
                </View>
            </View>
            <View style={styles.statusButtons}>
                {(['présent', 'absent', 'retard'] as const).map((s) => {
                    const isSelected = status === s;
                    const btnColors = getStatusColor(s);
                    return (
                        <TouchableOpacity
                            key={s}
                            onPress={() => onStatusChange(s)}
                            style={[
                                styles.statusBtn,
                                {
                                    backgroundColor: isSelected ? btnColors.text : colors.background.tertiary,
                                    borderWidth: 1,
                                    borderColor: isSelected ? 'transparent' : colors.border.light,
                                }
                            ]}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={
                                    s === 'présent' ? 'checkmark-circle' :
                                    s === 'absent' ? 'close-circle' : 'time'
                                }
                                size={18}
                                color={isSelected ? '#FFF' : colors.text.tertiary}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

interface StatCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    value: number | string;
    label: string;
    color: string;
    backgroundColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    icon,
    value,
    label,
    color,
    backgroundColor,
}) => {
    return (
        <View style={[styles.statCard, { backgroundColor }]}>
            <View style={styles.statHeader}>
                <Ionicons name={icon} size={20} color={color} />
                <Text style={[styles.statValue, { color }]}>
                    {value}
                </Text>
            </View>
            <Text style={[styles.statLabel, { color: '#6B7280' }]}>
                {label}
            </Text>
        </View>
    );
};

interface AbsenceCardProps {
    studentName: string;
    status: 'absent' | 'retard' | 'présent';
    time: string;
    initials: string;
}

export const AbsenceCard: React.FC<AbsenceCardProps> = ({
    studentName,
    status,
    time,
    initials,
}) => {
    const { colors } = useTheme();

    const getStatusConfig = (s: string) => {
        switch (s) {
            case 'absent':
                return { color: '#EF4444', bg: '#FEF2F2', icon: 'close-circle', label: 'Absent' };
            case 'retard':
                return { color: '#F59E0B', bg: '#FFFBEB', icon: 'time', label: 'Retard' };
            default:
                return { color: '#10B981', bg: '#F0FDF4', icon: 'checkmark-circle', label: 'Présent' };
        }
    };

    const statusConfig = getStatusConfig(status);

    return (
        <View style={[styles.absenceCard, { backgroundColor: colors.background.card }]}>
            <View style={styles.absenceLeft}>
                <View style={[styles.statusIcon, { backgroundColor: statusConfig.bg }]}>
                    <Ionicons name={statusConfig.icon as any} size={20} color={statusConfig.color} />
                </View>
                <View style={styles.absenceInfo}>
                    <Text style={[styles.absenceStudentName, { color: colors.text.primary }]}>
                        {studentName}
                    </Text>
                    <View style={styles.absenceMeta}>
                        <Ionicons name="time-outline" size={12} color={colors.text.tertiary} />
                        <Text style={[styles.absenceTime, { color: colors.text.tertiary }]}>
                            {time}
                        </Text>
                    </View>
                </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>
                    {statusConfig.label}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // ClassCard styles
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    nameRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    className: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: -0.3,
        flex: 1,
    },
    levelBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    levelText: {
        fontSize: 12,
        fontWeight: '600',
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 12,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 14,
        fontWeight: '500',
    },
    absenceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#FEF2F2',
        borderRadius: 6,
    },
    absenceBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#EF4444',
    },
    lateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#FFFBEB',
        borderRadius: 6,
    },
    lateBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#F59E0B',
    },

    // StudentCard styles
    studentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        marginRight: 12,
    },
    initials: {
        fontSize: 15,
        fontWeight: '700',
    },
    studentDetails: {
        flex: 1,
    },
    studentName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    studentCode: {
        fontSize: 12,
        fontWeight: '500',
    },
    statusButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    statusBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // StatCard styles
    statCard: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },

    // AbsenceCard styles
    absenceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    absenceLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    statusIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    absenceInfo: {
        flex: 1,
    },
    absenceStudentName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    absenceMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    absenceTime: {
        fontSize: 12,
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
});