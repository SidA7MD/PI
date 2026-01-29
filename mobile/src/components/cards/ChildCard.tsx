import { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { StatusBadge } from '../ui/StatusBadge';
import { Student } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme';

interface ChildCardProps {
    child: Student;
    onPress?: () => void;
}

export const ChildCard: FC<ChildCardProps> = ({ child, onPress }) => {
    const { colors } = useTheme();

    return (
        <Card onPress={onPress} style={{ marginBottom: spacing.md }}>
            <View style={styles.row}>
                <Avatar
                    source={child.photo}
                    name={`${child.firstName} ${child.lastName}`}
                    size="large"
                />
                <View style={styles.content}>
                    <Text style={[styles.name, { color: colors.text.primary }]}>
                        {child.firstName} {child.lastName}
                    </Text>
                    {child.class && (
                        <Text style={[styles.class, { color: colors.text.secondary }]}>
                            {child.class.name} - {child.class.level}
                        </Text>
                    )}
                    <View style={styles.badges}>
                        {child.lastStatus && (
                            <StatusBadge status={child.lastStatus} size="small" />
                        )}
                        {child.absencesThisMonth !== undefined && (
                            <Badge variant="info" size="small" style={{ marginLeft: spacing.xs }}>
                                {child.absencesThisMonth} absence(s) ce mois
                            </Badge>
                        )}
                    </View>
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
        fontSize: 18,
        fontWeight: '600',
    },
    class: {
        fontSize: 14,
        marginTop: 4,
    },
    badges: {
        flexDirection: 'row',
        marginTop: spacing.sm,
    },
});
