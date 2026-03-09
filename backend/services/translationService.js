/**
 * Simple translation service for backend notifications
 */

const translations = {
    fr: {
        absence_title: 'Nouvelle absence',
        absence_body: 'Votre enfant {firstName} {lastName} a été marqué absent{subject}{startTime} le {date}.',
        late_title: 'Nouveau retard',
        late_body: 'Votre enfant {firstName} {lastName} a été marqué en retard{subject}{startTime} le {date}.',
        summary_title: 'Résumé quotidien des présences',
        summary_body: '{content}',
        subject_part: ' en {subject}',
        time_part: ' à {startTime}',
    },
    ar: {
        absence_title: 'غياب جديد',
        absence_body: 'تم تسجيل غياب لطفلك {firstName} {lastName}{subject}{startTime} بتاريخ {date}.',
        late_title: 'تأخر جديد',
        late_body: 'تم تسجيل تأخر لطفلك {firstName} {lastName}{subject}{startTime} بتاريخ {date}.',
        summary_title: 'ملخص الحضور اليومي',
        summary_body: '{content}',
        subject_part: ' في مادة {subject}',
        time_part: ' على الساعة {startTime}',
    },
    en: {
        absence_title: 'New Absence',
        absence_body: 'Your child {firstName} {lastName} was marked absent{subject}{startTime} on {date}.',
        late_title: 'New Late',
        late_body: 'Your child {firstName} {lastName} was marked late{subject}{startTime} on {date}.',
        summary_title: 'Daily Attendance Summary',
        summary_body: '{content}',
        subject_part: ' in {subject}',
        time_part: ' at {startTime}',
    }
};

/**
 * Get a translated string with placeholders replaced
 * @param {string} lang - Language code ('fr', 'ar', 'en')
 * @param {string} key - Translation key
 * @param {object} params - Placeholders to replace
 * @returns {string}
 */
exports.t = (lang, key, params = {}) => {
    const language = translations[lang] || translations['fr'];
    let text = language[key] || key;

    Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), v || '');
    });

    return text;
};

/**
 * Helper to format subject and time strings based on language
 * @param {string} lang 
 * @param {string} subject 
 * @param {string} startTime 
 * @returns {object}
 */
exports.getParts = (lang, subject, startTime) => {
    const language = translations[lang] || translations['fr'];
    return {
        subject: subject ? language.subject_part.replace('{subject}', subject) : '',
        startTime: startTime ? language.time_part.replace('{startTime}', startTime) : ''
    };
};
