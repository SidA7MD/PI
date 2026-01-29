import { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './Button';
import { spacing } from '../../theme';

interface EmptyStateProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState: FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    actionLabel,
    onAction,
}) => {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <Ionicons name={icon} size={64} color={colors.text.disabled} />
            <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
            <Text style={[styles.description, { color: colors.text.secondary }]}>
                {description}
            </Text>
            {actionLabel && onAction && (
                <Button
                    title={actionLabel}
                    onPress={onAction}
                    variant="primary"
                    style={{ marginTop: spacing.lg }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: spacing.md,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        marginTop: spacing.sm,
        textAlign: 'center',
        lineHeight: 20,
    },
});
