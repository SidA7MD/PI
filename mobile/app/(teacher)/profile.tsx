import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Avatar } from '../../src/components/ui/Avatar';
import { spacing, shadows } from '../../src/theme';

export default function TeacherProfileScreen() {
    const router = useRouter();
    const { colors, theme, toggleTheme } = useTheme();
    const {user, logout } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const insets = useSafeAreaInsets();

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login');
    };

    const MenuItem = ({ icon, label, value, onPress, showChevron = true, color }: any) => (
        <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: colors.border.light }]} 
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.menuIconContainer, { backgroundColor: (color || colors.primary) + '15' }]}>
                <Ionicons name={icon} size={20} color={color || colors.primary} />
            </View>
            <Text style={[styles.menuText, { color: colors.text.primary }]}>
                {label}
            </Text>
            {value && (
                <Text style={[styles.menuValue, { color: colors.text.secondary }]}>
                    {value}
                </Text>
            )}
            {showChevron && (
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            )}
        </TouchableOpacity>
    );

    return (
        <>
            <SafeAreaView style={{ flex: 0, backgroundColor: colors.primary }} />
            <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
            <ScrollView 
                contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
                showsVerticalScrollIndicator={false}
            >
                {/* Premium Header */}
                <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={[styles.header, { paddingTop: insets.top + spacing.lg }]}
                >
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>{t('profile')}</Text>
                        <TouchableOpacity style={styles.editButton}>
                             <Ionicons name="pencil" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Hero Section - Overlapping */}
                <View style={styles.heroContainer}>
                    <Card style={styles.heroCard}>
                        <View style={styles.avatarContainer}>
                            <Avatar
                                name={user?.username || 'User'}
                                size="xlarge"
                            />
                            <TouchableOpacity style={[styles.cameraButton, { backgroundColor: colors.primary }]}>
                                <Ionicons name="camera" size={16} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        
                        <Text style={[styles.userName, { color: colors.text.primary }]}>
                            {user?.username || t('hello')}
                        </Text>
                        <Text style={[styles.userRole, { color: colors.text.secondary }]}>
                            Enseignant Principal
                        </Text>
                        
                        <View style={styles.heroStats}>
                            <View style={styles.statItem}>
                                <Ionicons name="mail-outline" size={16} color={colors.text.secondary} />
                                <Text style={[styles.statText, { color: colors.text.secondary }]}>
                                    {user?.email || t('email')}
                                </Text>
                            </View>
                            {user?.phone && (
                                <View style={styles.statItem}>
                                    <Ionicons name="call-outline" size={16} color={colors.text.tertiary} />
                                    <Text style={[styles.statText, { color: colors.text.secondary }]}>{user.phone}</Text>
                                </View>
                            )}
                        </View>
                    </Card>
                </View>

                {/* Menu Section */}
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionHeader, { color: colors.text.secondary }]}>MENU</Text>
                    <Card style={styles.menuCard}>
                        <MenuItem 
                            icon="home-outline" 
                            label={t('home')} 
                            onPress={() => router.push('/(teacher)')}
                            color={colors.primary}
                        />
                        <MenuItem 
                            icon="calendar-outline" 
                            label={t('history')} 
                            onPress={() => router.push('/(teacher)/history')}
                            color={colors.success}
                        />
                        <MenuItem 
                            icon="notifications-outline" 
                            label={t('notifications')} 
                            onPress={() => router.push('/(teacher)/notifications')}
                            color={colors.warning}
                        />
                    </Card>
                </View>

                {/* Settings Sections */}
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionHeader, { color: colors.text.secondary }]}>{t('settings').toUpperCase()}</Text>
                    <Card style={styles.menuCard}>
                        <MenuItem 
                            icon="moon-outline" 
                            label={t('theme')} 
                            value={theme === 'dark' ? t('darkMode') : t('lightMode')} 
                            onPress={toggleTheme}
                            showChevron={false}
                            color={colors.secondary}
                        />
                         <MenuItem 
                            icon="globe-outline" 
                            label={t('language')} 
                            onPress={() => {}}
                            color={colors.info}
                            showChevron={false}
                        />
                        <View style={styles.languageOptions}>
                            <TouchableOpacity
                                style={[
                                    styles.languageButton,
                                    { 
                                        backgroundColor: language === 'fr' ? colors.primary + '15' : colors.background.secondary,
                                        borderColor: language === 'fr' ? colors.primary : colors.border.light,
                                    }
                                ]}
                                onPress={() => setLanguage('fr')}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.flagEmoji}>🇫🇷</Text>
                                <Text style={[
                                    styles.languageText,
                                    { color: language === 'fr' ? colors.primary : colors.text.secondary }
                                ]}>
                                    Français
                                </Text>
                                {language === 'fr' && (
                                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[
                                    styles.languageButton,
                                    { 
                                        backgroundColor: language === 'ar' ? colors.primary + '15' : colors.background.secondary,
                                        borderColor: language === 'ar' ? colors.primary : colors.border.light,
                                    }
                                ]}
                                onPress={() => setLanguage('ar')}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.flagEmoji}>🇲🇦</Text>
                                <Text style={[
                                    styles.languageText,
                                    styles.arabicText,
                                    { color: language === 'ar' ? colors.primary : colors.text.secondary }
                                ]}>
                                    العربية
                                </Text>
                                {language === 'ar' && (
                                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </Card>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionHeader, { color: colors.text.secondary }]}>{t('support').toUpperCase()}</Text>
                    <Card style={styles.menuCard}>
                        <MenuItem 
                            icon="help-circle-outline" 
                            label={t('help')} 
                            onPress={() => {}}
                            color={colors.success}
                        />
                        <MenuItem 
                            icon="information-circle-outline" 
                            label={t('about')} 
                            onPress={() => {}}
                            color={colors.text.secondary}
                        />
                    </Card>
                </View>

                <Button
                    title={t('logout')}
                    onPress={handleLogout}
                    variant="danger-outline"
                    style={styles.logoutButton}
                    icon={<Ionicons name="log-out-outline" size={20} color={colors.danger} />}
                />
            </ScrollView>
        </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingBottom: 60, // Extra space for overlap
        paddingHorizontal: spacing.xl,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
    },
    editButton: {
        position: 'absolute',
        right: 0,
        padding: spacing.xs,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
    },
    heroContainer: {
        alignItems: 'center',
        marginTop: -40, // Negative margin to overlap
        marginBottom: spacing.lg,
    },
    heroCard: {
        width: '90%',
        alignItems: 'center',
        padding: spacing.xl,
        borderRadius: 24,
        ...shadows.lg,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: spacing.md,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 2,
    },
    userRole: {
        fontSize: 14,
        marginBottom: spacing.lg,
    },
    heroStats: {
        flexDirection: 'row',
        gap: spacing.lg,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 13,
    },
    sectionContainer: {
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
        opacity: 0.7,
        letterSpacing: 0.5,
    },
    menuCard: {
        padding: 0, // List items have their own padding
        overflow: 'hidden',
        borderRadius: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    menuValue: {
        fontSize: 14,
        marginRight: spacing.sm,
    },
    logoutButton: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.xl,
        borderColor: 'transparent',
    },
    languageOptions: {
        flexDirection: 'row',
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
    },
    languageButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        padding: spacing.md,
        borderRadius: 12,
        borderWidth: 2,
    },
    flagEmoji: {
        fontSize: 24,
    },
    languageText: {
        fontSize: 16,
        fontWeight: '600',
    },
    arabicText: {
        fontFamily: 'System', // Uses system Arabic font
        fontSize: 18,
    },
});
