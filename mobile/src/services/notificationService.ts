import api from './api';

export interface Notification {
    _id: string;
    recipient: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    read: boolean;
    createdAt: string;
}

export interface NotificationResponse {
    success: boolean;
    count: number;
    unreadCount: number;
    notifications: Notification[];
}

export const getNotifications = async (): Promise<NotificationResponse> => {
    const { data } = await api.get('/notifications');
    return data;
};

export const getUnreadCount = async (): Promise<{ success: boolean; count: number }> => {
    const { data } = await api.get('/notifications/unread-count');
    return data;
};

export const markAsRead = async (id: string): Promise<{ success: boolean; data: Notification }> => {
    const { data } = await api.post(`/notifications/${id}/read`);
    return data;
};

export const markAllAsRead = async (): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.post('/notifications/read-all');
    return data;
};