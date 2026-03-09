import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager, Alert } from 'react-native';
import api from '../services/api';

import { LanguageOption } from '../types/ProfileTypes';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'fr', name: 'Français', nativeName: 'Français', isRTL: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRTL: true },
  { code: 'en', name: 'English', nativeName: 'English', isRTL: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', isRTL: false },
];

export type LanguageCode = 'fr' | 'ar' | 'en' | 'es';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  isRTL: boolean;
  t: (key: string) => string;
  availableLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@app_language';

// Comprehensive translations
const translations = {
  fr: {
    // Common
    welcome: 'Bienvenue',
    hello: 'Bonjour',
    goodMorning: 'Bonjour',
    goodEvening: 'Bonsoir',
    loading: 'Chargement',
    error: 'Erreur',
    success: 'Succès',
    locale: 'fr-FR',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    search: 'Rechercher',
    logout: 'Déconnexion',
    yes: 'Oui',
    no: 'Non',
    ok: 'OK',

    // Navigation
    home: 'Accueil',
    profile: 'Profil',
    settings: 'Paramètres',
    notifications: 'Notifications',
    history: 'Historique',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',

    // Parent specific
    myChildren: 'Mes Enfants',
    absences: 'Absences',
    linkChild: 'Lier un enfant',
    childrenDashboard: 'Tableau de bord parent',
    totalChildren: 'Enfant(s)',
    totalAbsences: 'Absences totales',
    thisWeek: 'Cette semaine',
    thisWeekCount: 'cette semaine',
    attendanceRate: 'Taux de présence',
    quickActions: 'Actions rapides',
    viewAbsencesSubtitle: 'Voir les absences',
    linkChildSubtitle: 'Lier un enfant',
    linkChildHelp: 'Demandez le code unique à l\'école de votre enfant pour le lier à votre compte',
    viewHistory: 'Voir l\'historique',
    addNew: 'Ajouter un nouveau',
    noChildrenLinked: 'Aucun enfant lié',
    startLinking: 'Commencez par lier votre premier enfant pour suivre ses absences et son assiduité',
    linkFirstChild: 'Lier mon premier enfant',
    noChildren: 'Aucun enfant lié',
    noAbsences: 'Aucune absence',
    viewAbsences: 'Voir les absences',
    addChild: 'Ajouter un enfant',
    enterCode: 'Entrer le code',
    uniqueCode: 'Code unique',
    submitCode: 'Valider le code',

    // Teacher specific
    myClasses: 'Mes Classes',
    markAttendance: 'Faire l\'appel',
    students: 'Élèves',
    classes: 'Classes',
    attendance: 'Présence',
    absent: 'Absent',
    late: 'Retard',
    justified: 'Justifié',
    present: 'Présent',
    selectClass: 'Sélectionner une classe',
    selectDate: 'Sélectionner la date',
    markAbsent: 'Marquer absent',
    saveAttendance: 'Enregistrer',
    allPresent: 'Tous présents',

    // Profile
    personalInfo: 'Informations personnelles',
    contactInfo: 'Coordonnées',
    email: 'Email',
    phone: 'Téléphone',
    address: 'Adresse',

    // Settings
    theme: 'Thème',
    language: 'Langue',
    darkMode: 'Sombre',
    lightMode: 'Clair',
    french: 'Français',
    arabic: 'العربية',

    // Security
    security: 'Sécurité',
    changePassword: 'Changer le mot de passe',
    privacy: 'Confidentialité',

    // Support
    support: 'Support',
    help: 'Aide',
    about: 'À propos',
    version: 'Version',

    // Dates
    today: 'Aujourd\'hui',
    yesterday: 'Hier',
    thisMonth: 'Ce mois',
    date: 'Date',
    time: 'Heure',

    // Actions
    confirm: 'Confirmer',
    close: 'Fermer',
    refresh: 'Actualiser',
    filter: 'Filtrer',
    sort: 'Trier',

    // Messages
    noData: 'Aucune donnée disponible',
    loadingData: 'Chargement des données...',
    refreshing: 'Actualisation...',
    errorOccurred: 'Une erreur s\'est produite',
    tryAgain: 'Réessayer',

    // Status
    active: 'Actif',
    inactive: 'Inactif',
    pending: 'En attente',
    completed: 'Terminé',

    // Notifications
    notificationsTitle: 'Notifications',
    noNotifications: 'Aucune notification',
    markAsRead: 'Marquer comme lu',
    markAllRead: 'Tout marquer comme lu',
    deleteAll: 'Tout supprimer',
    unreadNotifications: 'Non lues',
    readNotifications: 'Lues',

    // Absences
    absenceDetails: 'Détails de l\'absence',
    reason: 'Motif',
    status: 'Statut',
    duration: 'Durée',
    class: 'Classe',
    student: 'Élève',
    teacher: 'Enseignant',
    addReason: 'Ajouter un motif',
    justify: 'Justifier',
    unjustified: 'Non justifié',

    // History
    absenceHistory: 'Historique des absences',
    filterByClass: 'Filtrer par classe',
    filterByDate: 'Filtrer par date',
    filterByStatus: 'Filtrer par statut',
    allClasses: 'Toutes les classes',
    allStatuses: 'Tous les statuts',

    // Link Child
    linkChildTitle: 'Lier un enfant',
    enterChildCode: 'Entrer le code unique de l\'enfant',
    codeProvided: 'Code fourni par l\'école',
    linkButton: 'Lier l\'enfant',
    invalidCode: 'Code invalide',
    childLinked: 'Enfant lié avec succès',
    childCodeLabel: 'Code Élève',
    childCodePlaceholder: 'Ex : ABC123XYZ',
    askAdminCode: 'Demandez ce code à l\'administration de l\'école',

    // Empty states
    noStudents: 'Aucun élève',
    noClasses: 'Aucune classe',
    noHistory: 'Aucun historique',
    startMarking: 'Commencer à pointer',

    // Stats
    total: 'Total',
    recent: 'Récent',
    percentage: 'Pourcentage',
    count: 'Nombre',

    // Auth
    appName: 'Khbarwelli',
    appSubtitle: 'Khbarwelli - Gestion des absences scolaires en Mauritanie',
    loginTitle: 'Se connecter',
    registerTitle: 'Créer un compte parent',
    registerSubtitle: 'Suivez les absences de vos enfants',
    identifierLabel: 'Téléphone, email ou nom d\'utilisateur',
    identifierPlaceholder: 'Entrez votre identifiant',
    passwordLabel: 'Mot de passe',
    passwordPlaceholder: 'Entrez votre mot de passe',
    confirmPasswordLabel: 'Confirmer le mot de passe',
    confirmPasswordPlaceholder: 'Retapez votre mot de passe',
    usernameLabel: 'Nom d\'utilisateur *',
    usernamePlaceholder: 'Votre nom d\'utilisateur',
    phoneLabel: 'Téléphone *',
    phonePlaceholder: 'XX XX XX XX',
    emailLabel: 'Email (optionnel)',
    emailPlaceholder: 'votre@email.com',
    forgotPassword: 'Mot de passe oublié ?',
    createAccount: 'Créer un compte',
    alreadyHaveAccount: 'Déjà un compte ? Se connecter',
    teacherAccountNote: 'Les comptes professeurs doivent être créés via l\'application web',
    loginError: 'Erreur de connexion',
    fillAllFields: 'Veuillez remplir tous les champs',
    usernameRequired: 'Nom d\'utilisateur requis',
    phoneRequired: 'Téléphone requis',
    invalidPhone: 'Numéro de téléphone invalide',
    invalidEmail: 'Email invalide',
    passwordMismatch: 'Les mots de passe ne correspondent pas',
    registerError: 'Erreur lors de l\'inscription',
    passwordLength: 'Au moins 6 caractères',
    usernameLength: 'Au moins 3 caractères requis',
    welcomeBack: 'Bienvenue de retour',
    forgotPasswordTitle: 'Mot de passe oublié ?',
    forgotPasswordSubtitle: 'Entrez votre email pour recevoir un lien de réinitialisation',
    enterEmailPrompt: 'Veuillez entrer votre email',
    sendResetLink: 'Envoyer le lien',
    emailSent: 'Email envoyé !',
    checkEmailInbox: 'Consultez votre boîte email pour réinitialiser votre mot de passe',
    backToLogin: 'Retour à la connexion',
    emailSendError: 'Erreur lors de l\'envoi de l\'email',

    // Additional Teacher Home
    markAttendanceDesc: 'Gérer la présence',
    historyDesc: 'Consulter les relevés',
    notificationsDesc: 'Consulter les notifications',
    viewProfile: 'Voir le profil',
    todaySummary: 'Résumé du jour',
    profileUpdated: 'Profil mis à jour avec succès',
    avatarUpdated: 'Photo de profil mise à jour',
  },
  ar: {
    // Common
    welcome: 'مرحبا',
    hello: 'أهلا',
    goodMorning: 'صباح الخير',
    goodEvening: 'مساء الخير',
    loading: 'جاري التحميل',
    error: 'خطأ',
    success: 'نجح',
    locale: 'ar-EG', // Arabic locale for dates
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    search: 'بحث',
    logout: 'تسجيل الخروج',
    yes: 'نعم',
    no: 'لا',
    ok: 'موافق',

    // Navigation
    home: 'الرئيسية',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    notifications: 'الإشعارات',
    history: 'السجل',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',

    // Parent specific
    myChildren: 'أطفالي',
    absences: 'الغيابات',
    linkChild: 'ربط طفل',
    childrenDashboard: 'لوحة تحكم الوالدين',
    totalChildren: 'أطفال',
    totalAbsences: 'مجموع الغيابات',
    thisWeek: 'هذا الأسبوع',
    thisWeekCount: 'هذا الأسبوع',
    attendanceRate: 'معدل الحضور',
    quickActions: 'إجراءات سريعة',
    viewAbsencesSubtitle: 'عرض الغيابات',
    linkChildSubtitle: 'ربط طفل',
    linkChildHelp: 'اطلب الرمز الفريد من مدرسة طفلك لربطه بحسابك',
    viewHistory: 'عرض السجل',
    addNew: 'إضافة جديد',
    noChildrenLinked: 'لا يوجد أطفال مرتبطون',
    startLinking: 'ابدأ بربط طفلك الأول لمتابعة غيابه وحضوره',
    linkFirstChild: 'ربط طفلي الأول',
    noChildren: 'لا يوجد أطفال مرتبطون',
    noAbsences: 'لا توجد غيابات',
    viewAbsences: 'عرض الغيابات',
    addChild: 'إضافة طفل',
    enterCode: 'أدخل الرمز',
    uniqueCode: 'الرمز الفريد',
    submitCode: 'إرسال الرمز',

    // Teacher specific
    myClasses: 'فصولي',
    markAttendance: 'تسجيل الحضور',
    students: 'الطلاب',
    classes: 'الفصول',
    attendance: 'الحضور',
    absent: 'غائب',
    late: 'متأخر',
    justified: 'مبرر',
    present: 'حاضر',
    selectClass: 'اختر الفصل',
    selectDate: 'اختر التاريخ',
    markAbsent: 'تعليم كغائب',
    saveAttendance: 'حفظ الحضور',
    allPresent: 'الكل حاضر',

    // Profile
    personalInfo: 'المعلومات الشخصية',
    contactInfo: 'معلومات الاتصال',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    address: 'العنوان',

    // Settings
    theme: 'المظهر',
    language: 'اللغة',
    darkMode: 'داكن',
    lightMode: 'فاتح',
    french: 'Français',
    arabic: 'العربية',

    // Security
    security: 'الأمان',
    changePassword: 'تغيير كلمة المرور',
    privacy: 'الخصوصية',

    // Support
    support: 'الدعم',
    help: 'المساعدة',
    about: 'حول',
    version: 'الإصدار',

    // Dates
    today: 'اليوم',
    yesterday: 'أمس',
    thisMonth: 'هذا الشهر',
    date: 'التاريخ',
    time: 'الوقت',

    // Actions
    confirm: 'تأكيد',
    close: 'إغلاق',
    refresh: 'تحديث',
    filter: 'تصفية',
    sort: 'ترتيب',

    // Messages
    noData: 'لا توجد بيانات متاحة',
    loadingData: 'جاري تحميل البيانات...',
    refreshing: 'جاري التحديث...',
    errorOccurred: 'حدث خطأ',
    tryAgain: 'حاول مرة أخرى',

    // Status
    active: 'نشط',
    inactive: 'غير نشط',
    pending: 'قيد الانتظار',
    completed: 'مكتمل',

    // Notifications
    notificationsTitle: 'الإشعارات',
    noNotifications: 'لا توجد إشعارات',
    markAsRead: 'تعليم كمقروء',
    markAllRead: 'تعليم الكل كمقروء',
    deleteAll: 'حذف الكل',
    unreadNotifications: 'غير مقروءة',
    readNotifications: 'مقروءة',

    // Absences
    absenceDetails: 'تفاصيل الغياب',
    reason: 'السبب',
    status: 'الحالة',
    duration: 'المدة',
    class: 'الفصل',
    student: 'الطالب',
    teacher: 'المعلم',
    addReason: 'إضافة سبب',
    justify: 'تبرير',
    unjustified: 'غير مبرر',

    // History
    absenceHistory: 'سجل الغيابات',
    filterByClass: 'تصفية حسب الفصل',
    filterByDate: 'تصفية حسب التاريخ',
    filterByStatus: 'تصفية حسب الحالة',
    allClasses: 'كل الفصول',
    allStatuses: 'كل الحالات',

    // Link Child
    linkChildTitle: 'ربط طفل',
    enterChildCode: 'أدخل الرمز الفريد للطفل',
    codeProvided: 'الرمز المقدم من المدرسة',
    linkButton: 'ربط الطفل',
    invalidCode: 'رمز غير صالح',
    childLinked: 'تم ربط الطفل بنجاح',
    childCodeLabel: 'رمز الطالب',
    childCodePlaceholder: 'مثال: ABC123XYZ',
    askAdminCode: 'اطلب هذا الرمز من إدارة المدرسة',

    // Empty states
    noStudents: 'لا يوجد طلاب',
    noClasses: 'لا توجد فصول',
    noHistory: 'لا يوجد سجل',
    startMarking: 'ابدأ التسجيل',

    // Stats
    total: 'المجموع',
    recent: 'الأخيرة',
    percentage: 'النسبة المئوية',
    count: 'العدد',

    // Auth
    appName: 'Khbarwelli',
    appSubtitle: 'Khbarwelli - إدارة الغياب المدرسي في موريتانيا',
    loginTitle: 'تسجيل الدخول',
    registerTitle: 'إنشاء حساب ولي أمر',
    registerSubtitle: 'تابع غيابات أطفالك',
    identifierLabel: 'الهاتف، البريد الإلكتروني أو اسم المستخدم',
    identifierPlaceholder: 'أدخل معرفك',
    passwordLabel: 'كلمة المرور',
    passwordPlaceholder: 'أدخل كلمة المرور',
    confirmPasswordLabel: 'تأكيد كلمة المرور',
    confirmPasswordPlaceholder: 'أعد كتابة كلمة المرور',
    usernameLabel: 'اسم المستخدم *',
    usernamePlaceholder: 'اسم المستخدم الخاص بك',
    phoneLabel: 'الهاتف *',
    phonePlaceholder: 'XX XX XX XX',
    emailLabel: 'البريد الإلكتروني (اختياري)',
    emailPlaceholder: 'name@email.com',
    forgotPassword: 'نسيت كلمة المرور؟',
    createAccount: 'إنشاء حساب',
    alreadyHaveAccount: 'لديك حساب بالفعل؟ تسجيل الدخول',
    teacherAccountNote: 'يجب إنشاء حسابات المعلمين عبر تطبيق الويب',
    loginError: 'خطأ في تسجيل الدخول',
    fillAllFields: 'يرجى ملء جميع الحقول',
    usernameRequired: 'اسم المستخدم مطلوب',
    phoneRequired: 'الهاتف مطلوب',
    invalidPhone: 'رقم هاتف غير صالح',
    invalidEmail: 'بريد إلكتروني غير صالح',
    passwordMismatch: 'كلمات المرور غير متطابقة',
    registerError: 'خطأ أثناء التسجيل',
    passwordLength: '6 أحرف على الأقل',
    usernameLength: '3 أحرف على الأقل مطلوبة',
    welcomeBack: 'مرحبا بعودتك',
    forgotPasswordTitle: 'نسيت كلمة المرور؟',
    forgotPasswordSubtitle: 'أدخل بريدك الإلكتروني لتلقي رابط إعادة التعيين',
    enterEmailPrompt: 'يرجى إدخال بريدك الإلكتروني',
    sendResetLink: 'إرسال الرابط',
    emailSent: 'تم إرسال البريد الإلكتروني!',
    checkEmailInbox: 'تحقق من صندوق بريدك الإلكتروني لإعادة تعيين كلمة المرور',
    backToLogin: 'العودة إلى تسجيل الدخول',
    emailSendError: 'خطأ في إرسال البريد الإلكتروني',

    // Additional Teacher Home
    markAttendanceDesc: 'إدارة الحضور',
    historyDesc: 'عرض السجلات',
    notificationsDesc: 'عرض الإشعارات',
    viewProfile: 'عرض الملف الشخصي',
    todaySummary: 'ملخص اليوم',
    profileUpdated: 'تم تحديث الملف الشخصي بنجاح',
    avatarUpdated: 'تم تحديث صورة الملف الشخصي',
  },
  en: {
    // Common
    welcome: 'Welcome',
    hello: 'Hello',
    goodMorning: 'Good Morning',
    goodEvening: 'Good Evening',
    loading: 'Loading',
    error: 'Error',
    success: 'Success',
    locale: 'en-US',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    logout: 'Logout',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',

    // Navigation
    home: 'Home',
    profile: 'Profile',
    settings: 'Settings',
    notifications: 'Notifications',
    history: 'History',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',

    // Parent specific
    myChildren: 'My Children',
    absences: 'Absences',
    linkChild: 'Link Child',
    childrenDashboard: 'Parent Dashboard',
    totalChildren: 'Child(ren)',
    totalAbsences: 'Total Absences',
    thisWeek: 'This week',
    thisWeekCount: 'this week',
    attendanceRate: 'Attendance Rate',
    quickActions: 'Quick Actions',
    viewAbsencesSubtitle: 'View absences',
    linkChildSubtitle: 'Link a child',
    linkChildHelp: 'Ask for the unique code from your child\'s school to link them to your account',
    viewHistory: 'View History',
    addNew: 'Add New',
    noChildrenLinked: 'No children linked',
    startLinking: 'Start by linking your first child to track their absences',
    linkFirstChild: 'Link my first child',
    noChildren: 'No children linked',
    noAbsences: 'No absences',
    viewAbsences: 'View Absences',
    addChild: 'Add Child',
    enterCode: 'Enter Code',
    uniqueCode: 'Unique Code',
    submitCode: 'Submit Code',

    // Teacher specific
    myClasses: 'My Classes',
    markAttendance: 'Mark Attendance',
    students: 'Students',
    classes: 'Classes',
    attendance: 'Attendance',
    absent: 'Absent',
    late: 'Late',
    justified: 'Justified',
    present: 'Present',
    selectClass: 'Select Class',
    selectDate: 'Select Date',
    markAbsent: 'Mark Absent',
    saveAttendance: 'Save',
    allPresent: 'All Present',

    // Profile
    personalInfo: 'Personal Information',
    contactInfo: 'Contact Information',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',

    // Settings
    theme: 'Theme',
    language: 'Language',
    darkMode: 'Dark',
    lightMode: 'Light',
    french: 'Français',
    arabic: 'Arabic',

    // Security
    security: 'Security',
    changePassword: 'Change Password',
    privacy: 'Privacy',

    // Support
    support: 'Support',
    help: 'Help',
    about: 'About',
    version: 'Version',

    // Dates
    today: 'Today',
    yesterday: 'Yesterday',
    thisMonth: 'This Month',
    date: 'Date',
    time: 'Time',

    // Actions
    confirm: 'Confirm',
    close: 'Close',
    refresh: 'Refresh',
    filter: 'Filter',
    sort: 'Sort',

    // Messages
    noData: 'No data available',
    loadingData: 'Loading data...',
    refreshing: 'Refreshing...',
    errorOccurred: 'An error occurred',
    tryAgain: 'Try Again',

    // Status
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    completed: 'Completed',

    // Notifications
    notificationsTitle: 'Notifications',
    noNotifications: 'No notifications',
    markAsRead: 'Mark as read',
    markAllRead: 'Mark all as read',
    deleteAll: 'Delete all',
    unreadNotifications: 'Unread',
    readNotifications: 'Read',

    // Absences
    absenceDetails: 'Absence Details',
    reason: 'Reason',
    status: 'Status',
    duration: 'Duration',
    class: 'Class',
    student: 'Student',
    teacher: 'Teacher',
    addReason: 'Add Reason',
    justify: 'Justify',
    unjustified: 'Unjustified',

    // History
    absenceHistory: 'Absence History',
    filterByClass: 'Filter by class',
    filterByDate: 'Filter by date',
    filterByStatus: 'Filter by status',
    allClasses: 'All Classes',
    allStatuses: 'All Statuses',

    // Link Child
    linkChildTitle: 'Link Child',
    enterChildCode: 'Enter child\'s unique code',
    codeProvided: 'Code provided by school',
    linkButton: 'Link Child',
    invalidCode: 'Invalid code',
    childLinked: 'Child linked successfully',
    childCodeLabel: 'Student Code',
    childCodePlaceholder: 'Ex: ABC123XYZ',
    askAdminCode: 'Ask school administration for this code',

    // Empty states
    noStudents: 'No students',
    noClasses: 'No classes',
    noHistory: 'No history',
    startMarking: 'Start Marking',

    // Stats
    total: 'Total',
    recent: 'Recent',
    percentage: 'Percentage',
    count: 'Count',

    // Auth
    appName: 'Khbarwelli',
    appSubtitle: 'Khbarwelli - School Absence Management in Mauritania',
    loginTitle: 'Login',
    registerTitle: 'Create Parent Account',
    registerSubtitle: 'Track your children\'s absences',
    identifierLabel: 'Phone, Email or Username',
    identifierPlaceholder: 'Enter your identifier',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    confirmPasswordLabel: 'Confirm Password',
    confirmPasswordPlaceholder: 'Re-type your password',
    usernameLabel: 'Username *',
    usernamePlaceholder: 'Your username',
    phoneLabel: 'Phone *',
    phonePlaceholder: 'XX XX XX XX',
    emailLabel: 'Email (optional)',
    emailPlaceholder: 'name@email.com',
    forgotPassword: 'Forgot Password?',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account? Login',
    teacherAccountNote: 'Teacher accounts must be created via web portal',
    loginError: 'Login Error',
    fillAllFields: 'Please fill all fields',
    usernameRequired: 'Username required',
    phoneRequired: 'Phone required',
    invalidPhone: 'Invalid phone number',
    invalidEmail: 'Invalid email',
    passwordMismatch: 'Passwords do not match',
    registerError: 'Registration Error',
    passwordLength: 'At least 6 characters',
    usernameLength: 'At least 3 characters required',
    welcomeBack: 'Welcome back',
    forgotPasswordTitle: 'Forgot Password?',
    forgotPasswordSubtitle: 'Enter your email to receive a reset link',
    enterEmailPrompt: 'Please enter your email',
    sendResetLink: 'Send Reset Link',
    emailSent: 'Email Sent!',
    checkEmailInbox: 'Check your email inbox to reset your password',
    backToLogin: 'Back to Login',
    emailSendError: 'Error sending email',

    // Additional Teacher Home
    markAttendanceDesc: 'Manage Attendance',
    historyDesc: 'View Records',
    notificationsDesc: 'View Notifications',
    viewProfile: 'View Profile',
    todaySummary: 'Today\'s Summary',
    profileUpdated: 'Profile updated successfully',
    avatarUpdated: 'Profile photo updated',
  },
  es: {
    // Minimal Spanish fallback for now
    welcome: 'Bienvenido',
    hello: 'Hola',
    loading: 'Cargando',
    error: 'Error',
    success: 'Éxito',
    locale: 'es-ES',
    save: 'Guardar',
    cancel: 'Cancelar',
    // ... (We can expand later)
  }
} as const;

type TranslationKey = keyof typeof translations.fr;

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('fr');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageCode | null;
      if (savedLanguage && SUPPORTED_LANGUAGES.some(l => l.code === savedLanguage)) {
        setLanguageState(savedLanguage);
        setIsRTL(savedLanguage === 'ar');
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: LanguageCode): Promise<void> => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguageState(lang);
      const needsRTL = lang === 'ar';
      setIsRTL(needsRTL);

      // Sync with backend if authenticated
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          await api.put('/auth/me', { language: lang });
          console.log(`🌐 Language preference '${lang}' synced with server`);
        }
      } catch (syncError) {
        console.log('🌐 Failed to sync language with server (not critical)');
      }

      // Check if RTL needs to change
      if (needsRTL !== I18nManager.isRTL) {
        I18nManager.forceRTL(needsRTL);
        // Alert user to restart the app
        Alert.alert(
          needsRTL ? 'إعادة التشغيل مطلوبة' : 'Redémarrage requis',
          needsRTL
            ? 'يرجى إعادة تشغيل التطبيق لتطبيق التغييرات'
            : 'Veuillez redémarrer l\'application pour appliquer les changements',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    const translationKey = key as TranslationKey;
    // @ts-ignore - Handle missing keys in other languages gracefully
    return translations[language]?.[translationKey] || translations['fr'][translationKey] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    isRTL,
    t,
    availableLanguages: SUPPORTED_LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}