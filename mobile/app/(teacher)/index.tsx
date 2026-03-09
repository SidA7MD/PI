import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { Button } from '../../src/components/ui/Button';
import { spacing, shadows } from '../../src/theme';
import { formatDisplayName } from '../../src/utils/formatters';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import * as teacherService from '../../src/services/teacherService';
import { TeacherStats } from '../../src/services/teacherService';

// Extracted sub-components for better organization and reusability
interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
  textColor: {
    primary: string;
    secondary: string;
  };
}

const StatCard = React.memo<StatCardProps>(({ label, value, icon, color, backgroundColor, textColor }) => (
  <View style={[styles.statCard, { backgroundColor }]} accessibilityRole="summary">
    <View style={styles.statContent}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View>
        <Text style={[styles.statValue, { color: textColor.primary }]} accessibilityLabel={`${value} ${label}`}>
          {value}
        </Text>
        <Text style={[styles.statLabel, { color: textColor.secondary }]}>{label}</Text>
      </View>
    </View>
  </View>
));

StatCard.displayName = 'StatCard';

interface ActionButtonProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color: string;
  backgroundColor: string;
  textColor: {
    primary: string;
    secondary: string;
  };
}

const ActionButton = React.memo<ActionButtonProps>(
  ({ title, subtitle, icon, onPress, color, backgroundColor, textColor }) => (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      accessibilityHint="Tap to navigate"
    >
      <View style={styles.actionContent}>
        <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.actionInfo}>
          <Text style={[styles.actionTitle, { color: textColor.primary }]}>{title}</Text>
          <Text style={[styles.actionSubtitle, { color: textColor.secondary }]}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={textColor.secondary} />
      </View>
    </TouchableOpacity>
  )
);

ActionButton.displayName = 'ActionButton';

export default function TeacherHomeScreen() {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const { t, language } = useLanguage();
  const insets = useSafeAreaInsets();

  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized load stats function
  const loadStats = useCallback(async () => {
    try {
      setError(null);
      const data = await teacherService.getTeacherStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError(t('errorLoadingStats') || 'Failed to load statistics');

      // Show alert for critical errors
      Alert.alert(
        t('error') || 'Error',
        t('errorLoadingStats') || 'Failed to load statistics. Please try again.',
        [{ text: t('ok') || 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Load stats on mount and focus
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  // Memoized action handlers
  const handleMarkAttendance = useCallback(() => {
    router.push('/(teacher)/mark-absence');
  }, [router]);

  const handleHistory = useCallback(() => {
    router.push('/(teacher)/history');
  }, [router]);

  const handleNotifications = useCallback(() => {
    router.push('/(teacher)/notifications');
  }, [router]);

  const handleProfile = useCallback(() => {
    router.push('/(teacher)/profile');
  }, [router]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      t('logout') || 'Logout',
      t('logoutConfirm') || 'Are you sure you want to logout?',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        { text: t('logout') || 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  }, [logout, t]);

  // Memoized user initials
  const userInitials = useMemo(() => {
    if (!user?.username) return 'T';
    const names = user.username.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return user.username[0].toUpperCase();
  }, [user?.username]);

  // Memoized action buttons configuration
  const actionButtons = useMemo(
    () => [
      {
        title: t('markAttendance'),
        subtitle: t('markAttendanceDesc'),
        icon: 'checkbox-outline' as keyof typeof Ionicons.glyphMap,
        color: colors.success,
        onPress: handleMarkAttendance,
      },
      {
        title: t('history'),
        subtitle: t('historyDesc'),
        icon: 'calendar-outline' as keyof typeof Ionicons.glyphMap,
        color: colors.warning,
        onPress: handleHistory,
      },
      {
        title: t('notifications'),
        subtitle: t('notificationsDesc'),
        icon: 'notifications-outline' as keyof typeof Ionicons.glyphMap,
        color: colors.info || '#3B82F6',
        onPress: handleNotifications,
      },
    ],
    [t, colors, handleMarkAttendance, handleHistory, handleNotifications]
  );

  // Loading state
  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background.secondary }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
          {t('loading') || 'Loading...'}
        </Text>
      </View>
    );
  }

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: colors.primary }} />
      <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* Header with Gradient */}
          <View style={styles.headerContainer}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.gradientHeader, { paddingTop: insets.top + spacing.lg }]}
            >
              <View style={styles.headerContent}>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.welcomeLabel}>
                    {new Date().getHours() < 12 ? t('goodMorning') || 'Bonjour' : (new Date().getHours() < 18 ? t('hello') || 'Bonjour' : t('goodEvening') || 'Bonsoir')} 👋
                  </Text>
                  <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
                    {formatDisplayName(user?.username || t('teacher'))}
                  </Text>
                  <View style={styles.headerStatsRow}>
                    <Text style={styles.dateText}>
                      {new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </Text>
                    <View style={styles.dotSeparator} />
                    <View style={styles.classCountBadge}>
                      <Ionicons name="school" size={12} color="#FFF" />
                      <Text style={styles.classCountText}>
                        {stats?.totalClasses || 0} {t('classes') || 'Classes'}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.profileButton}
                  onPress={handleProfile}
                  accessibilityRole="button"
                  accessibilityLabel={t('viewProfile')}
                >
                  <Text style={styles.profileInitials}>{userInitials}</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>



          {/* Error Message */}
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.danger + '15' }]}>
              <Ionicons name="alert-circle" size={20} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            </View>
          )}

          {/* Main Content */}
          <View style={styles.content}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary, writingDirection: 'auto' }]}>
              {t('home')}
            </Text>

            <View style={styles.actionsGrid}>
              {actionButtons.map((button, index) => (
                <ActionButton
                  key={index}
                  title={button.title}
                  subtitle={button.subtitle}
                  icon={button.icon}
                  color={button.color}
                  onPress={button.onPress}
                  backgroundColor={colors.background.card}
                  textColor={colors.text}
                />
              ))}
            </View>

            {/* Today's Summary (if available) */}
            {stats?.todayStats && (
              <View style={[styles.summaryCard, { backgroundColor: colors.background.card }]}>
                <Text style={[styles.summaryTitle, { color: colors.text.primary, writingDirection: 'auto' }]}>
                  {t('todaySummary')}
                </Text>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: colors.success }]}>
                      {stats?.todayStats?.presents || 0}
                    </Text>
                    <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>
                      {t('present') || 'Present'}
                    </Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: colors.danger }]}>
                      {stats?.todayStats?.absences || 0}
                    </Text>
                    <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>
                      {t('absent') || 'Absent'}
                    </Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: colors.warning }]}>
                      {stats?.todayStats?.lates || 0}
                    </Text>
                    <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>
                      {t('late') || 'Late'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Logout Button */}
            <Button
              title={t('logout')}
              onPress={handleLogout}
              variant="danger-outline"
              style={styles.logoutButton}
            />
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
  },
  headerContainer: {
    overflow: 'hidden',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...shadows.lg,
  },
  gradientHeader: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  welcomeLabel: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginBottom: 2,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 6,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  profileButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    ...shadows.md,
  },
  profileInitials: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: -40,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.md,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 8,
  },
  classCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  classCountText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  actionsGrid: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    borderRadius: 20,
    ...shadows.md,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  summaryCard: {
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  logoutButton: {
    marginTop: spacing.xl,
    borderColor: 'transparent',
  },
});