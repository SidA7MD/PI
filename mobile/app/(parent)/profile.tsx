import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Image,
  RefreshControl,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';

import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { useAuth } from '../../src/context/AuthContext';
import { spacing, shadows } from '../../src/theme';

// New components & Services
import { LanguageSelector } from '../../src/components/profile/LanguageSelector';
import { EditProfileModal } from '../../src/components/profile/EditProfileModal';
import { AvatarPicker } from '../../src/components/profile/AvatarPicker';
import { ProfileService } from '../../src/services/ProfileService';
import { UserProfile } from '../../src/types/ProfileTypes';

const HEADER_HEIGHT = 200;

export default function ParentProfileScreen() {
  const router = useRouter();
  const { colors, theme, toggleTheme } = useTheme();
  // @ts-ignore
  const { t, language, isRTL, availableLanguages } = useLanguage();
  const { user: authUser, logout, refreshUser } = useAuth(); // Destructure refreshUser

  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile | null>(authUser as unknown as UserProfile);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showEditValues, setShowEditValues] = useState(false);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  const fetchProfile = async () => {
      try {
          const data = await ProfileService.getProfile();
          setProfile(data);
          // Sync global auth state if profile differs
          if (data && JSON.stringify(data) !== JSON.stringify(authUser)) {
             refreshUser();
          }
      } catch (err) {
          if (authUser) {
              setProfile(authUser as unknown as UserProfile); 
          }
      }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfile();
    await refreshUser(); // Refresh global state on pull-to-refresh
    setRefreshing(false);
  }, []);

  useEffect(() => {
      fetchProfile();
  }, []);

  const handleUpdateProfile = async (data: Partial<UserProfile>) => {
      try {
          const updated = await ProfileService.updateProfile(data);
          setProfile(updated);
          await refreshUser(); // Essential: Update global context
          Alert.alert(t('success') || 'Success', t('profileUpdated') || 'Profile updated successfully');
      } catch (error) {
          Alert.alert(t('error') || 'Error', t('errorOccurred') || 'An error occurred');
      }
  };

  const handleAvatarUpdate = async (uri: string) => {
      setIsLoading(true);
      try {
          const newUrl = await ProfileService.uploadAvatar(uri);
          setProfile(prev => prev ? { ...prev, avatarUrl: newUrl } : null);
          Alert.alert(t('success') || 'Success', t('avatarUpdated') || 'Photo updated');
      } catch (error) {
          // Fallback for demo without backend
          setProfile(prev => prev ? { ...prev, avatarUrl: uri } : null);
      } finally {
          setIsLoading(false);
      }
  };

  const currentLanguageName = availableLanguages?.find((l: any) => l.code === language)?.nativeName || 'Français';

  const renderSettingItem = (
    icon: string,
    label: string,
    value?: string | boolean,
    onPress?: () => void,
    isSwitch?: boolean,
    color?: string
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderColor: colors.border.light }]}
      onPress={isSwitch ? undefined : onPress}
      disabled={isSwitch}
      activeOpacity={0.7}
    >
      <View style={[styles.settingIconContainer, { backgroundColor: (color || colors.primary) + '15' }]}>
        <Ionicons name={icon as any} size={22} color={color || colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, { color: colors.text.primary, textAlign: isRTL ? 'right' : 'left' }]}>
          {label}
        </Text>
      </View>
      <View style={styles.settingRight}>
        {isSwitch ? (
          <Switch
            value={value as boolean}
            onValueChange={onPress}
            trackColor={{ false: colors.border.medium, true: colors.primary }}
            thumbColor={'#FFF'}
          />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {value && (
              <Text style={[styles.settingValue, { color: colors.text.secondary }]}>
                {value as string}
              </Text>
            )}
            <Ionicons 
                name={isRTL ? "chevron-back" : "chevron-forward"} 
                size={20} 
                color={colors.text.tertiary} 
                style={{ marginLeft: 8 }}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Hero Section */}
      <View style={{ height: HEADER_HEIGHT }}>
        <LinearGradient
            colors={[colors.primary, '#4466cc']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
        >
            <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>{t('profile') || 'Profile'}</Text>
            </View>
        </LinearGradient>
        
        {/* Profile Card - Floating */}
        <View style={[
            styles.profileCard, 
            { 
                backgroundColor: colors.background.card,
                shadowColor: colors.shadow,
            }
        ]}>
            <View style={styles.avatarContainer}>
                {profile?.avatarUrl ? (
                    <Image
                        source={{ uri: profile.avatarUrl }}
                        style={styles.avatar}
                    />
                ) : (
                    <View style={[styles.avatar, styles.placeholderAvatar]}>
                        <Ionicons name="person" size={60} color={colors.text.tertiary} />
                    </View>
                )}
                <AvatarPicker onImageSelected={handleAvatarUpdate} isLoading={isLoading} />
            </View>
            
            <View style={styles.profileInfo}>
                <Text style={[styles.userName, { color: colors.text.primary }]}>
                    {profile?.username || authUser?.username || t('loading')}
                </Text>
                <Text style={[styles.userRole, { color: colors.text.secondary }]}>
                    {profile?.email || authUser?.email || ''}
                </Text>
                
                <TouchableOpacity 
                    style={[styles.editButton, { backgroundColor: colors.primary + '15' }]}
                    onPress={() => setShowEditValues(true)}
                >
                    <Text style={[styles.editButtonText, { color: colors.primary }]}>{t('edit') || 'Edit'}</Text>
                </TouchableOpacity>
            </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: 200 }]}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        
        {/* Account Settings */}
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.secondary, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('settings') || 'Settings'}
            </Text>
            
            <View style={[styles.sectionCard, { backgroundColor: colors.background.card }]}>
                {renderSettingItem(
                    'language',
                    t('language') || 'Language',
                    currentLanguageName,
                    () => setShowLanguageSelector(true),
                    false,
                    '#8e44ad'
                )}
                
                {renderSettingItem(
                    theme === 'dark' ? 'moon' : 'sunny',
                    t('darkMode') || 'Dark Mode',
                    theme === 'dark',
                    toggleTheme,
                    true,
                    '#f39c12'
                )}

                {renderSettingItem(
                    'notifications',
                    t('notifications') || 'Notifications',
                    notificationsEnabled,
                    () => setNotificationsEnabled(!notificationsEnabled),
                    true,
                    '#e74c3c'
                )}
            </View>
        </View>

        {/* Support & Legal */}
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.secondary, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('support') || 'Support'}
            </Text>
            
            <View style={[styles.sectionCard, { backgroundColor: colors.background.card }]}>
                {renderSettingItem('help-buoy', t('help') || 'Help', undefined, () => {}, false, '#2980b9')}
                {renderSettingItem('lock-closed', t('privacy') || 'Privacy', undefined, () => {}, false, '#7f8c8d')}
                {renderSettingItem('information-circle', t('about') || 'About', 'v1.0.0', () => {}, false, '#95a5a6')}
            </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: colors.danger, marginBottom: 10 }]}
          onPress={logout}
        >
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>{t('logout') || 'Logout'}</Text>
        </TouchableOpacity>
        
        <View style={{ height: 10 }} />
      </ScrollView>

      {/* Modals */}
      <LanguageSelector 
        visible={showLanguageSelector} 
        onClose={() => setShowLanguageSelector(false)} 
      />
      
      {profile && (
          <EditProfileModal
            visible={showEditValues}
            onClose={() => setShowEditValues(false)}
            user={profile}
            onSave={handleUpdateProfile}
          />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    height: HEADER_HEIGHT,
    paddingTop: Constants.statusBarHeight,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  headerContent: {
      width: '100%',
      alignItems: 'center',
      marginTop: spacing.md,
  },
  headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#FFF',
  },
  profileCard: {
    position: 'absolute',
    top: 100,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.md,
    zIndex: 10,
  },
  avatarContainer: {
    marginTop: -50,
    marginBottom: spacing.md,
    borderRadius: 60,
    padding: 4,
    backgroundColor: '#FFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  placeholderAvatar: {
      backgroundColor: '#f0f0f0',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#ddd',
  },
  profileInfo: {
      alignItems: 'center',
      width: '100%',
  },
  userName: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 4,
  },
  userRole: {
      fontSize: 14,
      marginBottom: spacing.lg,
  },
  editButton: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.sm,
      borderRadius: 20,
  },
  editButtonText: {
      fontSize: 14,
      fontWeight: '600',
  },
  scrollContent: {
      paddingHorizontal: spacing.lg,
  },
  section: {
      marginBottom: 12,
  },
  sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
      marginLeft: 4,
  },
  sectionCard: {
      borderRadius: 20,
      overflow: 'hidden',
  },
  settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
  },
  settingIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
  },
  settingContent: {
      flex: 1,
  },
  settingLabel: {
      fontSize: 16,
      fontWeight: '500',
  },
  settingRight: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  settingValue: {
      fontSize: 14,
      marginRight: spacing.xs,
  },
  logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.md,
      borderRadius: 16,
      borderWidth: 1,
      backgroundColor: 'transparent',
      gap: spacing.sm,
  },
  logoutText: {
      fontSize: 16,
      fontWeight: '600',
  }
});
