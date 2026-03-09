export const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
    if (match) {
        return `${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
    }
    return phone;
};

export const formatPercentage = (value: number): string => {
    return `${Math.round(value)}%`;
};

export const formatNumber = (value: number): string => {
    return value.toLocaleString('fr-FR');
};

export const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/** Format username for display: "john doe" → "John Doe", "mohamed" → "Mohamed" */
export const formatDisplayName = (name: string): string => {
    if (!name || !name.trim()) return '';
    return name
        .trim()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

export const truncate = (str: string, maxLength: number): string => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '...';
};
