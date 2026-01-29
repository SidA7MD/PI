import { FC } from 'react';
import { ViewStyle } from 'react-native';
import { Badge } from './Badge';

interface StatusBadgeProps {
    status: 'present' | 'absent' | 'late' | 'justified' | 'unjustified' | 'présent' | 'retard';
    size?: 'small' | 'medium';
    style?: ViewStyle;
}

export const StatusBadge: FC<StatusBadgeProps> = ({ status, size = 'medium', style }) => {
    const config: Record<string, { label: string; variant: any }> = {
        present: { label: 'Présent', variant: 'success' },
        présent: { label: 'Présent', variant: 'success' },
        absent: { label: 'Absent', variant: 'danger' },
        late: { label: 'Retard', variant: 'warning' },
        retard: { label: 'Retard', variant: 'warning' },
        justified: { label: 'Justifié', variant: 'success' },
        unjustified: { label: 'Non justifié', variant: 'danger' },
    };

    const { label, variant } = config[status] || { label: status, variant: 'primary' };

    return (
        <Badge variant={variant} size={size} style={style}>
            {label}
        </Badge>
    );
};
