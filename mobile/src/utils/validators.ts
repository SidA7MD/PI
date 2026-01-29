export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
    // Remove spaces, dashes, dots
    const cleanPhone = phone.replace(/[\s\-\.]/g, '');
    
    // Check if it's a valid phone number (8-15 digits)
    // Supports formats like: 0612345678, +33612345678, etc.
    const phoneRegex = /^(\+)?[0-9]{8,15}$/;
    return phoneRegex.test(cleanPhone);
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