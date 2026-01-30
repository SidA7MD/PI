export interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatarUrl?: string | null;
  role: 'parent' | 'teacher';
  children?: string[]; // IDs of linked children
  createdAt?: string;
  updatedAt?: string;
}

export interface LanguageOption {
  code: 'fr' | 'ar' | 'en' | 'es';
  name: string;
  nativeName: string;
  isRTL: boolean;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  types: {
    absence: boolean;
    announcement: boolean;
    message: boolean;
  };
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationSettings;
  biometricsEnabled: boolean;
}
