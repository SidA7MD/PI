
export interface Colors {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    background: {
        primary: string;
        secondary: string;
        card: string;
        modal: string;
    };
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
        disabled: string;
        inverse: string;
    };
    border: {
        light: string;
        medium: string;
        dark: string;
    };
    status: {
        success: string;
        warning: string;
        error: string;
        info: string;
    };
    gradients: {
        primary: [string, string];
        secondary: [string, string];
        background: [string, string, string];
        card: [string, string];
    };
    glass: {
        background: string;
        border: string;
    };
}

// Professional design system - refined, premium feel
const commonColors = {
    primary: '#5B4FD1',
    primaryDark: '#4338A3',
    primaryLight: '#8B7EE8',
    secondary: '#0EA5E9',
    accent: '#F43F5E',
    status: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
    },
};

export const lightColors: Colors = {
    ...commonColors,
    success: commonColors.status.success,
    warning: commonColors.status.warning,
    danger: commonColors.status.error,
    info: commonColors.status.info,
    background: {
        primary: '#F8FAFC',
        secondary: '#FFFFFF',
        card: '#FFFFFF',
        modal: '#FFFFFF',
    },
    text: {
        primary: '#1E293B',
        secondary: '#64748B',
        tertiary: '#94A3B8',
        disabled: '#CBD5E1',
        inverse: '#FFFFFF',
    },
    border: {
        light: '#F1F5F9',
        medium: '#E2E8F0',
        dark: '#94A3B8',
    },
    gradients: {
        primary: ['#6D5CE7', '#5B4FD1'],
        secondary: ['#0EA5E9', '#0284C7'],
        background: ['#4F46E5', '#4338CA', '#3730A3'],
        card: ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)'],
    },
    glass: {
        background: 'rgba(255, 255, 255, 0.85)',
        border: 'rgba(255, 255, 255, 0.6)',
    },
};

export const darkColors: Colors = {
    ...commonColors,
    primary: '#7C6EED',
    primaryDark: '#5B4FD1',
    success: commonColors.status.success,
    warning: commonColors.status.warning,
    danger: commonColors.status.error,
    info: commonColors.status.info,
    background: {
        primary: '#0F172A',
        secondary: '#1E293B',
        card: '#1E293B',
        modal: '#334155',
    },
    text: {
        primary: '#F8FAFC',
        secondary: '#94A3B8',
        tertiary: '#64748B',
        disabled: '#475569',
        inverse: '#1E293B',
    },
    border: {
        light: '#334155',
        medium: '#475569',
        dark: '#64748B',
    },
    gradients: {
        primary: ['#7C6EED', '#6D5CE7'],
        secondary: ['#38BDF8', '#0EA5E9'],
        background: ['#312E81', '#3730A3', '#1E1B4B'],
        card: ['rgba(30, 41, 59, 0.9)', 'rgba(15, 23, 42, 0.95)'],
    },
    glass: {
        background: 'rgba(30, 41, 59, 0.8)',
        border: 'rgba(255, 255, 255, 0.08)',
    },
};
