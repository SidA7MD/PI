export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
    // Remove spaces, dashes, dots
    const cleanPhone = phone.replace(/[\s\-\.]/g, '');
    
    // Mauritanian phone numbers: +222 followed by 8 digits
    // Support formats: +222XXXXXXXX or XXXXXXXX (8 digits without country code)
    
    // Check if it starts with +222
    if (cleanPhone.startsWith('+222')) {
        // Must be exactly +222 followed by 8 digits
        return /^\+222[0-9]{8}$/.test(cleanPhone);
    }
    
    // If no country code, must be exactly 8 digits (will be prepended with +222)
    return /^[0-9]{8}$/.test(cleanPhone);
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (!password) {
        return { valid: false, message: 'Le mot de passe est requis' };
    }
    
    if (password.length < 6) {
        return { valid: false, message: 'Le mot de passe doit contenir au moins 6 caractères' };
    }
    
    return { valid: true };
};

export const validateUsername = (username: string): { valid: boolean; message?: string } => {
    if (!username) {
        return { valid: false, message: 'Le nom d\'utilisateur est requis' };
    }
    
    if (username.length < 3) {
        return { valid: false, message: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' };
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { 
            valid: false, 
            message: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores' 
        };
    }
    
    return { valid: true };
};