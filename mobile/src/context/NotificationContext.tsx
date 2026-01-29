import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as notificationService from '../services/notificationService';
import { Notification } from '../types/index';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    registerForNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (notificationId: string) => void;
    isNotificationSupported: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationSupported, setIsNotificationSupported] = useState(false);

    useEffect(() => {
        // Check if notifications are available
        const notificationsAvailable = notificationService.areNotificationsAvailable();
        setIsNotificationSupported(notificationsAvailable);

        if (!notificationsAvailable) {
            console.log('⚠️ Running in Expo Go - notifications disabled');
            return;
        }

        // Register for push notifications
        registerForNotifications();

        // Listen for incoming notifications
        const receivedSubscription = notificationService.addNotificationReceivedListener(
            (notification) => {
                console.log('Notification received:', notification);
                // Add to notifications list
                const newNotification: Notification = {
                    _id: Date.now().toString(),
                    user: '',
                    title: notification.request.content.title || '',
                    message: notification.request.content.body || '',
                    type: 'absence',
                    read: false,
                    data: notification.request.content.data,
                    createdAt: new Date(),
                };
                setNotifications((prev) => [newNotification, ...prev]);
                setUnreadCount((prev) => prev + 1);
            }
        );

        const responseSubscription = notificationService.addNotificationResponseReceivedListener(
            (response) => {
                console.log('Notification response:', response);
                // Handle notification tap
            }
        );

        return () => {
            if (receivedSubscription?.remove) {
                receivedSubscription.remove();
            }
            if (responseSubscription?.remove) {
                responseSubscription.remove();
            }
        };
    }, []);

    const registerForNotifications = async () => {
        try {
            await notificationService.registerForPushNotifications();
        } catch (error) {
            console.error('Failed to register for notifications:', error);
        }
    };

    const markAsRead = (notificationId: string) => {
        setNotifications((prev) =>
            prev.map((notif) =>
                notif._id === notificationId ? { ...notif, read: true } : notif
            )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications((prev) =>
            prev.map((notif) => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
    };

    const deleteNotification = (notificationId: string) => {
        setNotifications((prev) => {
            const notif = prev.find((n) => n._id === notificationId);
            if (notif && !notif.read) {
                setUnreadCount((count) => Math.max(0, count - 1));
            }
            return prev.filter((n) => n._id !== notificationId);
        });
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                registerForNotifications,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                isNotificationSupported,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};