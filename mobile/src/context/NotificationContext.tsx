import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import * as notificationService from '../services/notificationService';
import { Notification } from '../services/notificationService';
import * as authService from '../services/authService';

// Replicate API_URL logic from api.ts
const API_URL = process.env.EXPO_PUBLIC_API_URL || 
                Constants.expoConfig?.extra?.apiUrl || 
                'http://10.17.12.218:5001/api';

const SOCKET_URL = API_URL.replace('/api', '');

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // Required on iOS
    shouldShowList: true, // Required on iOS
  }),
});

interface NotificationContextData {
    socket: Socket | null;
    isConnected: boolean;
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
    expoPushToken: string | undefined;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const { user, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>('');
    const notificationListener = useRef<Notifications.EventSubscription>(undefined);
    const responseListener = useRef<Notifications.EventSubscription>(undefined);

    // Register for push notifications
    useEffect(() => {
        if (isAuthenticated && user) {
            registerForPushNotificationsAsync().then(token => {
                setExpoPushToken(token);
                if (token) {
                    console.log('📬 Expo Push Token:', token);
                    // Update user profile with push token
                    authService.updateProfile({ pushToken: token })
                        .then(() => console.log('✅ Push Token synced with backend'))
                        .catch(err => console.error('❌ Failed to sync push token:', err));
                }
            });

            // Listeners
            notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
                console.log('🔔 Push Notification Received:', notification);
                // Can manually refresh notifications list here
                loadNotifications();
            });

            responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                console.log('👆 Notification Tapped:', response);
                // Handle navigation here if needed
            });

            return () => {
                if (notificationListener.current) notificationListener.current.remove();
                if (responseListener.current) responseListener.current.remove();
            };
        }
    }, [isAuthenticated, user]);

    // Initialiser le socket quand l'utilisateur est connecté
    useEffect(() => {
        if (!isAuthenticated || !user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        console.log('🔌 Connecting to Socket.io at:', SOCKET_URL);
        
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            console.log('✅ Socket connected:', newSocket.id);
            setIsConnected(true);
            
            // Explicitly join the user room
            console.log('🔗 Joining room for user:', user._id);
            newSocket.emit('join', user._id);
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
            console.log('⚠️ Socket connection error:', err.message);
        });

        // Écouter les notifications d'absence (Socket)
        newSocket.on('notification:absence', (notification: Notification) => {
            console.log('🔔 New socket notification received:', notification);
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        setSocket(newSocket);

        // Charger les notifications initiales
        loadNotifications();

        return () => {
            newSocket.disconnect();
        };
    }, [isAuthenticated, user]);

    const loadNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        try {
            await notificationService.markAsRead(id);
        } catch (error) {
            console.error('Error marking as read:', error);
            // Revert if error? For now, we keep optimistic
        }
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        
        try {
            await notificationService.markAllAsRead();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const refreshNotifications = async () => {
        await loadNotifications();
    };

    return (
        <NotificationContext.Provider value={{
            socket,
            isConnected,
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            refreshNotifications,
            expoPushToken
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // If you use bare workflow, you need to provide projectId manually if missing from app.json
    try {
        token = (await Notifications.getExpoPushTokenAsync({
            // projectId: Constants.expoConfig?.extra?.eas?.projectId, // Not always needed if using Expo Go
        })).data;
    } catch (e) {
        console.error('Error fetching push token:', e);
    }
  } else {
    // alert('Must use physical device for Push Notifications');
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}