import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager, Alert } from 'react-native';

type Language = 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  isRTL: boolean;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@app_language';

// Comprehensive translations
const translations = {
  fr: {
    // Common
    welcome: 'Bienvenue',
    hello: 'Bonjour',
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
    appName: 'SchoolAbsence',
    appSubtitle: 'Gestion des absences scolaires',
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
    phonePlaceholder: '06 12 34 56 78',
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
    
    // Additional Teacher Home
    markAttendanceDesc: 'Gérer la présence',
    historyDesc: 'Consulter les relevés',
    notificationsDesc: 'Consulter les notifications',
    viewProfile: 'Voir le profil',
    todaySummary: 'Résumé du jour', 
    quickActions: 'Actions rapides',
  },
  ar: {
    // Common
    welcome: 'مرحبا',
    hello: 'أهلا',
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
    appName: 'SchoolAbsence',
    appSubtitle: 'إدارة الغياب المدرسي',
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
    phonePlaceholder: '06 12 34 56 78',
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

    // Additional Teacher Home
    markAttendanceDesc: 'إدارة الحضور',
    historyDesc: 'عرض السجلات',
    notificationsDesc: 'عرض الإشعارات',
    viewProfile: 'عرض الملف الشخصي',
    todaySummary: 'ملخص اليوم',
    quickActions: 'إجراءات سريعة',
  }
} as const;

type TranslationKey = keyof typeof translations.fr;

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fr');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage === 'ar' || savedLanguage === 'fr') {
        setLanguageState(savedLanguage);
        setIsRTL(savedLanguage === 'ar');
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: Language): Promise<void> => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguageState(lang);
      const needsRTL = lang === 'ar';
      setIsRTL(needsRTL);

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
    return translations[language][translationKey] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    isRTL,
    t,
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