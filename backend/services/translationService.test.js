const { t, getParts } = require('./translationService');

describe('TranslationService', () => {
    describe('t() function', () => {
        test('should translate a simple key in French (default)', () => {
            expect(t('fr', 'absence_title')).toBe('Nouvelle absence');
        });

        test('should translate a simple key in Arabic', () => {
            expect(t('ar', 'absence_title')).toBe('غياب جديد');
        });

        test('should translate a simple key in English', () => {
            expect(t('en', 'absence_title')).toBe('New Absence');
        });

        test('should replace placeholders correctly', () => {
            const params = { firstName: 'Ahmed', lastName: 'Ali', date: '24/02/2026', subject: '', startTime: '' };
            const result = t('fr', 'absence_body', params);
            expect(result).toContain('Ahmed Ali');
            expect(result).toContain('24/02/2026');
        });

        test('should fallback to French if language is not supported', () => {
            expect(t('es', 'absence_title')).toBe('Nouvelle absence');
        });

        test('should return the key if translation is missing', () => {
            expect(t('fr', 'non_existent_key')).toBe('non_existent_key');
        });
    });

    describe('getParts() function', () => {
        test('should format subject and time correctly in French', () => {
            const parts = getParts('fr', 'Maths', '08:00');
            expect(parts.subject).toBe(' en Maths');
            expect(parts.startTime).toBe(' à 08:00');
        });

        test('should format subject and time correctly in Arabic', () => {
            const parts = getParts('ar', 'الرياضيات', '08:00');
            expect(parts.subject).toBe(' في مادة الرياضيات');
            expect(parts.startTime).toBe(' على الساعة 08:00');
        });

        test('should return empty strings if parameters are missing', () => {
            const parts = getParts('fr', null, null);
            expect(parts.subject).toBe('');
            expect(parts.startTime).toBe('');
        });
    });
});
