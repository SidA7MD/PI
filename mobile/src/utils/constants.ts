export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export const ROLES = {
    TEACHER: 'teacher',
    PARENT: 'parent',
} as const;

export const ABSENCE_TYPES = {
    ABSENT: 'absent',
    PRESENT: 'présent',
    LATE: 'retard',
} as const;

export const ABSENCE_STATUS = {
    JUSTIFIED: 'justified',
    UNJUSTIFIED: 'unjustified',
} as const;

export const NOTIFICATION_TYPES = {
    ABSENCE: 'absence',
    LATE: 'late',
    REMINDER: 'reminder',
} as const;
