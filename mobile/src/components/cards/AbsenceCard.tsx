import { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { Absence, Student } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

interface AbsenceCardProps {
    absence: import('../../types/index').Absence;
    showStudent?: boolean;
    onPress?: () => void;
}

export const AbsenceCard: FC<AbsenceCardProps> = ({
    absence,
    showStudent = false,
    onPress,
}) => {
    const { colors } = useTheme();
    const student = absence.student as Student;

    return (
        <Card onPress={onPress} style={{ marginBottom: spacing.sm }}>
            <View>
                <View style={styles.header}>
                    <Text style={[styles.date, { color: colors.text.secondary }]}>
                        {format(new Date(absence.date), 'EEEE d MMMM yyyy', { locale: fr })}
                    </Text>
                </View>

                {showStudent && student && (
                    <Text style={[styles.studentName, { color: colors.text.primary }]}>
                        {student.firstName} {student.lastName}
                    </Text>
                )}

                <View style={styles.badges}>
                    <StatusBadge status={absence.absenceType} size="small" />
                    <StatusBadge status={absence.status} size="small" style={{ marginLeft: spacing.xs }} />
                </View>

                {absence.reason && (
                    <Text style={[styles.reason, { color: colors.text.secondary }]}>
                        Raison: {absence.reason}
                    </Text>
                )}

                {absence.notes && (
                    <Text style={[styles.notes, { color: colors.text.tertiary }]}>
                        {absence.notes}
                    </Text>
                )}
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    header: {
        marginBottom: spacing.sm,
    },
    date: {
        fontSize: 13,
        fontWeight: '500',
    },
    studentName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    badges: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    reason: {
        fontSize: 14,
        marginTop: spacing.xs,
    },
    notes: {
        fontSize: 13,
        marginTop: spacing.xs,
        fontStyle: 'italic',
    },
});
