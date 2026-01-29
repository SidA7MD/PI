import { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Student } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme';

interface StudentCardProps {
    student: Student;
    showAbsenceBadge?: boolean;
    showClass?: boolean;
    onPress?: () => void;
}

export const StudentCard: FC<StudentCardProps> = ({
    student,
    showAbsenceBadge = false,
    showClass = false,
    onPress,
}) => {
    const { colors } = useTheme();

    return (
        <Card onPress={onPress} style={{ marginBottom: spacing.sm }}>
            <View style={styles.row}>
                <Avatar
                    source={student.photo}
                    name={`${student.firstName} ${student.lastName}`}
                    size="medium"
                />
                <View style={styles.content}>
                    <Text style={[styles.name, { color: colors.text.primary }]}>
                        {student.firstName} {student.lastName}
                    </Text>
                    {showClass && student.class && (
                        <Text style={[styles.class, { color: colors.text.secondary }]}>
                            {student.class.name}
                        </Text>
                    )}
                    {showAbsenceBadge && student.absencesCount && student.absencesCount > 0 && (
                        <Badge variant="danger" size="small" style={{ marginTop: spacing.xs }}>
                            {student.absencesCount} absence(s)
                        </Badge>
                    )}
                </View>
                {onPress && (
                    <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                )}
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        marginLeft: spacing.md,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
    },
    class: {
        fontSize: 14,
        marginTop: 2,
    },
});
