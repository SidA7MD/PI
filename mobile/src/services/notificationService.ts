import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Conditional imports - only import if not in Expo Go
let Notifications: any = null;
let Device: any = null;

if (!isExpoGo) {
    try {
        Notifications = require('expo-notifications');
        Device = require('expo-device');
        
        // Configuration du handler de notifications (only if not Expo Go)
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
            }),
        });
    } catch (error) {
        console.log('⚠️ Notifications not available in Expo Go');
    }
}

export const registerForPushNotifications = async (): Promise<string | null> => {
    // Return early if in Expo Go
    if (isExpoGo) {
        console.log('⚠️ Push notifications are not supported in Expo Go. Use a development build.');
        return null;
    }

    if (!Notifications || !Device) {
        console.log('⚠️ Notification modules not loaded');
        return null;
    }

    if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return null;
    }

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return null;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });

        const token = tokenData.data;

        // Send token to backend
        try {
            // Récupérer l'utilisateur connecté depuis AsyncStorage
            const userStr = await AsyncStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            if (user && (user._id || user.id)) {
                const userId = user._id || user.id;
                await api.post('/notifications/register', {
                    pushToken: token,
                    userId: userId
                });
                console.log('✅ Push token enregistré avec succès');
            } else {
                console.log('⚠️ Utilisateur non connecté, push token non envoyé');
            }
        } catch (error) {
            console.error('Error registering push token:', error);
        }

        // Configure Android notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#3B82F6',
            });
        }

        return token;
    } catch (error) {
        console.error('Error in registerForPushNotifications:', error);
        return null;
    }
};

export const scheduleDailyReminder = async (hour: number, minute: number): Promise<string | null> => {
    if (isExpoGo || !Notifications) {
        console.log('⚠️ Scheduled notifications not supported in Expo Go');
        return null;
    }

    try {
        // Cancel existing scheduled notifications to avoid duplicates
        await Notifications.cancelAllScheduledNotificationsAsync();

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Rappel Pointage 📋',
                body: "N'oubliez pas de marquer les absences de vos classes!",
                sound: true,
            },
            trigger: {
                hour: hour,
                minute: minute,
                repeats: true,
            },
        });

        console.log('Daily reminder scheduled:', notificationId);
        return notificationId;
    } catch (error) {
        console.error('Error scheduling daily reminder:', error);
        return null;
    }
};

export const cancelAllNotifications = async (): Promise<void> => {
    if (isExpoGo || !Notifications) {
        console.log('⚠️ Notifications not supported in Expo Go');
        return;
    }

    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('All notifications cancelled');
    } catch (error) {
        console.error('Error canceling notifications:', error);
    }
};

export const addNotificationReceivedListener = (
    callback: (notification: any) => void
) => {
    if (isExpoGo || !Notifications) {
        console.log('⚠️ Notification listeners not supported in Expo Go');
        return { remove: () => {} };
    }

    return Notifications.addNotificationReceivedListener(callback);
};

export const addNotificationResponseReceivedListener = (
    callback: (response: any) => void
) => {
    if (isExpoGo || !Notifications) {
        console.log('⚠️ Notification listeners not supported in Expo Go');
        return { remove: () => {} };
    }

    return Notifications.addNotificationResponseReceivedListener(callback);
};

// Helper function to check notification permissions
export const checkNotificationPermissions = async (): Promise<boolean> => {
    if (isExpoGo || !Notifications) {
        return false;
    }

    try {
        const { status } = await Notifications.getPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('Error checking permissions:', error);
        return false;
    }
};

// Helper function to get scheduled notifications
export const getScheduledNotifications = async (): Promise<any[]> => {
    if (isExpoGo || !Notifications) {
        return [];
    }

    try {
        const notifications = await Notifications.getAllScheduledNotificationsAsync();
        return notifications;
    } catch (error) {
        console.error('Error getting scheduled notifications:', error);
        return [];
    }
};

// Helper to check if notifications are available
export const areNotificationsAvailable = (): boolean => {
    return !isExpoGo && Notifications !== null;
};