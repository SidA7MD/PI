import React, { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

const translations = {
    fr: {
        // General
        dashboard: 'Tableau de bord',
        profile: 'Profil',
        logout: 'Déconnexion',
        loading: 'Chargement...',
        actions: 'Actions',
        save: 'Enregistrer',
        cancel: 'Annuler',
        delete: 'Supprimer',
        edit: 'Modifier',
        search: 'Rechercher...',

        // Header/Sidebar
        teachers: 'Professeurs',
        classes: 'Classes',
        students: 'Élèves',
        absences: 'Absences',
        history: 'Historique',

        // Super Admin
        registered_schools: 'Écoles Inscrites',
        parent_users: 'Parents Utilisateurs',
        total_revenue: 'Revenu Estimé',
        add_school: 'Ajouter une école',
        school_name: 'Nom de l\'école',
        admin_email: 'Email de l\'admin',
        admin_username: 'Username de l\'admin',
        password: 'Mot de passe',
        create_school: 'Créer l\'école',

        // Teacher
        mark_attendance: 'Faire l\'appel',
        class: 'Classe',
        date: 'Date',
        present: 'Présent',
        absent: 'Absent',
        late: 'Retard',
        justified: 'Justifié',
        submit_attendance: 'Valider l\'appel',
        my_classes: 'Mes Classes',
        total_students: 'Total Élèves',
        today_absences: 'Absences Auj.',
        today_lates: 'Retards Auj.',
        history_title: 'Historique',
        attendance_ready: 'Prêt pour faire l\'appel aujourd\'hui ?',
        no_classes_assigned: 'Aucune classe assignée',
        contact_admin: 'Contactez l\'administrateur si nécessaire',

        // School Admin
        quick_actions: 'Actions Rapides',
        add_teacher: 'Ajouter un prof',
        create_teacher_account: 'Créer un compte enseignant',
        new_class: 'Nouvelle classe',
        add_class: 'Ajouter une classe',
        enroll_student: 'Inscrire un élève',
        add_student_to_class: 'Ajouter un élève à une classe',
        manage_absences: 'Gérer Absences',
        view_absence_reports: 'Voir les rapports d\'absence',
        welcome_admin: 'Bienvenue sur votre tableau de bord administrateur',

        // Titles
        teachers_management: 'Gestion des Professeurs',
        classes_management: 'Gestion des Classes',
        students_management: 'Gestion des Élèves',
        absences_management: 'Gestion des Absences',

        // Lists
        registered_count: 'Enregistrés',
        no_items_found: 'Aucun élément trouvé',
        add_first: 'Ajoutez votre premier élément',
        search_teachers: 'Rechercher un professeur...',
        search_classes: 'Rechercher une classe...',
        search_students: 'Rechercher un élève...',

        // Forms
        new_teacher: 'Nouveau Professeur',
        edit_teacher: 'Modifier Professeur',
        new_class_form: 'Nouvelle Classe', // Renamed to avoid conflict with 'new_class' under School Admin
        edit_class: 'Modifier Classe',
        new_student: 'Nouveau Élève',
        edit_student: 'Modifier Élève',
        personal_info: 'Informations Personnelles',
        username_label: 'Nom d\'utilisateur',
        phone_label: 'Téléphone',
        security_section: 'Sécurité',
        password_hint: '(laisser vide pour ne pas changer)',
        saving: 'Enregistrement...',
        error_loading: 'Erreur lors du chargement',

        // Confirmations
        confirm_delete_teacher: 'Voulez-vous vraiment supprimer ce professeur ?',
        confirm_delete_class: 'Voulez-vous vraiment supprimer cette classe ?',
        confirm_delete_student: 'Voulez-vous vraiment supprimer cet élève ?',

        // Absences Dashboard
        absences_history: 'Historique des absences',
        tracking_absences: 'Suivi des absences des élèves',
        no_absences_recorded: 'Aucune absence enregistrée',
        justified_label: 'Justifié',
        not_justified_label: 'Non justifié',
        loading_absences: 'Chargement des absences...',

        // Teacher Attendance / History
        mark_attendance_title: 'Faire l\'appel',
        tap_students_hint: 'Touchez les élèves pour changer leur statut',
        subject_label: 'Matière',
        start_time_label: 'Heure de début',
        attendance_success: 'Appel enregistré avec succès !',
        error_saving_attendance: 'Erreur lors de l\'enregistrement',
        confirm_all_present: 'Tout le monde est présent ?',
        view_reported_absences: 'Consultez les absences signalées',
        filter_all: 'Tout',
        filter_today: 'Aujourd\'hui',
        filter_week: 'Cette semaine',
        school_label: 'École',

        // Profile
        my_profile: 'Mon Profil',
        manage_personal_info: 'Gérez vos informations personnelles',
        role_label: 'Rôle',
        profile_updated: 'Profil mis à jour !',
        edit_profile_btn: 'Modifier mon profil',
        save_changes_btn: 'Enregistrer modifications',

        // Login
        welcome_back: 'Bon retour !',
        login_subtitle: 'Connectez-vous pour gérer votre établissement',
        email_label: 'Email',
        password_label: 'Mot de passe',
        login_button: 'Se connecter',
        logging_in: 'Connexion...',
        invalid_credentials: 'Identifiants invalides',
    },
    ar: {
        // General
        dashboard: 'لوحة القيادة',
        profile: 'الملف الشخصي',
        logout: 'تسجيل الخروج',
        loading: 'جاري التحميل...',
        actions: 'الإجراءات',
        save: 'حفظ',
        cancel: 'إلغاء',
        delete: 'حذف',
        edit: 'تعديل',
        search: 'بحث...',

        // Header/Sidebar
        teachers: 'الأساتذة',
        classes: 'الفصول',
        students: 'الطلاب',
        absences: 'الغيابات',
        history: 'السجل',

        // Super Admin
        registered_schools: 'المدارس المسجلة',
        parent_users: 'أولياء الأمور',
        total_revenue: 'الدخل التقديري',
        add_school: 'إضافة مدرسة',
        school_name: 'اسم المدرسة',
        admin_email: 'البريد الإلكتروني للمسؤول',
        admin_username: 'اسم المستخدم للمسؤول',
        password: 'كلمة المرور',
        create_school: 'إنشاء المدرسة',

        // Teacher
        mark_attendance: 'تسجيل الحضور',
        class: 'الفصل',
        date: 'التاريخ',
        present: 'حاضر',
        absent: 'غائب',
        late: 'متأخر',
        justified: 'مبرر',
        submit_attendance: 'تأكيد الحضور',
        my_classes: 'فصولي',
        total_students: 'مجموع الطلاب',
        today_absences: 'غيابات اليوم',
        today_lates: 'تأخيرات اليوم',
        history_title: 'السجل',
        attendance_ready: 'هل أنت مستعد لتسجيل الحضور اليوم؟',
        no_classes_assigned: 'لا توجد فصول مسندة',
        contact_admin: 'اتصل بالمسؤول إذا لزم الأمر',

        // School Admin
        quick_actions: 'إجراءات سريعة',
        add_teacher: 'إضافة أستاذ',
        create_teacher_account: 'إنشاء حساب أستاذ',
        new_class: 'فصل جديد',
        add_class: 'إضافة فصل',
        enroll_student: 'تسجيل طالب',
        add_student_to_class: 'إضافة طالب إلى فصل',
        manage_absences: 'إدارة الغيابات',
        view_absence_reports: 'عرض تقارير الغياب',
        welcome_admin: 'مرحباً بكم في لوحة تحكم المسؤول',

        // Titles
        teachers_management: 'إدارة الأساتذة',
        classes_management: 'إدارة الفصول',
        students_management: 'إدارة الطلاب',
        absences_management: 'إدارة الغيابات',

        // Lists
        registered_count: 'مسجل',
        no_items_found: 'لم يتم العثور على أي عناصر',
        add_first: 'أضف أول عنصر لديك',
        search_teachers: 'بحث عن أستاذ...',
        search_classes: 'بحث عن فصل...',
        search_students: 'بحث عن طالب...',

        // Forms
        new_teacher: 'أستاذ جديد',
        edit_teacher: 'تعديل أستاذ',
        new_class_form: 'فصل جديد', // Renamed to avoid conflict with 'new_class' under School Admin
        edit_class: 'تعديل فصل',
        new_student: 'طالب جديد',
        edit_student: 'تعديل طالب',
        personal_info: 'المعلومات الشخصية',
        username_label: 'اسم المستخدم',
        phone_label: 'الهاتف',
        security_section: 'الأمان',
        password_hint: '(اتركه فارغاً لعدم التغيير)',
        saving: 'جاري الحفظ...',
        error_loading: 'خطأ أثناء التحميل',

        // Confirmations
        confirm_delete_teacher: 'هل أنت متأكد من حذف هذا الأستاذ؟',
        confirm_delete_class: 'هل أنت متأكد من حذف هذا الفصل؟',
        confirm_delete_student: 'هل أنت متأكد من حذف هذا الطالب؟',

        // Absences Dashboard
        absences_history: 'سجل الغيابات',
        tracking_absences: 'تتبع غيابات الطلاب',
        no_absences_recorded: 'لم يتم تسجيل أي غيابات',
        justified_label: 'مبرر',
        not_justified_label: 'غير مبرر',
        loading_absences: 'جاري تحميل الغيابات...',

        // Teacher Attendance / History
        mark_attendance_title: 'تسجيل الحضور',
        tap_students_hint: 'اضغط على الطلاب لتغيير حالتهم',
        subject_label: 'المادة',
        start_time_label: 'وقت البدء',
        attendance_success: 'تم تسجيل الحضور بنجاح!',
        error_saving_attendance: 'خطأ أثناء الحفظ',
        confirm_all_present: 'هل الجميع حاضرون؟',
        view_reported_absences: 'اطلع على الغيابات المبلغ عنها',
        filter_all: 'الكل',
        filter_today: 'اليوم',
        filter_week: 'هذا الأسبوع',
        school_label: 'مدرسة',

        // Profile
        my_profile: 'ملفي الشخصي',
        manage_personal_info: 'إدارة معلوماتك الشخصية',
        role_label: 'الدور',
        profile_updated: 'تم تحديث الملف الشخصي!',
        edit_profile_btn: 'تعديل ملفي الشخصي',
        save_changes_btn: 'حفظ التغييرات',

        // Login
        welcome_back: 'مرحباً بعودتك!',
        login_subtitle: 'سجل الدخول لإدارة مؤسستك',
        email_label: 'البريد الإلكتروني',
        password_label: 'كلمة المرور',
        login_button: 'تسجيل الدخول',
        logging_in: 'جاري الدخول...',
        invalid_credentials: 'بيانات الاعتماد غير صالحة',
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'fr');

    useEffect(() => {
        localStorage.setItem('language', language);
        // Handle RTL
        if (language === 'ar') {
            document.dir = 'rtl';
            document.body.classList.add('rtl');
        } else {
            document.dir = 'ltr';
            document.body.classList.remove('rtl');
        }
    }, [language]);

    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
