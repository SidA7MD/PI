import { format, formatDistance, formatRelative } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

export const formatDate = (date: Date | string, formatStr: string = 'dd/MM/yyyy'): string => {
    return format(new Date(date), formatStr, { locale: fr });
};

export const formatDateTime = (date: Date | string): string => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr });
};

export const formatRelativeTime = (date: Date | string): string => {
    return formatDistance(new Date(date), new Date(), { addSuffix: true, locale: fr });
};

export const formatRelativeDate = (date: Date | string): string => {
    return formatRelative(new Date(date), new Date(), { locale: fr });
};

export const isToday = (date: Date | string): boolean => {
    const today = new Date();
    const checkDate = new Date(date);
    return (
        checkDate.getDate() === today.getDate() &&
        checkDate.getMonth() === today.getMonth() &&
        checkDate.getFullYear() === today.getFullYear()
    );
};

export const isThisWeek = (date: Date | string): boolean => {
    const today = new Date();
    const checkDate = new Date(date);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return checkDate >= weekAgo && checkDate <= today;
};

export const isThisMonth = (date: Date | string): boolean => {
    const today = new Date();
    const checkDate = new Date(date);
    return (
        checkDate.getMonth() === today.getMonth() &&
        checkDate.getFullYear() === today.getFullYear()
    );
};
