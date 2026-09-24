import { apiClient } from './api-client';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  userId: string | null;
  createdAt: string;
  read: boolean;
}

export const notificationsApi = {
  async list(): Promise<NotificationItem[]> {
    return apiClient.get<NotificationItem[]>('/notifications');
  },

  async markRead(notificationId: string): Promise<void> {
    await apiClient.patch<{ success: boolean }>(`/notifications/${notificationId}/read`);
  },

  async markAllRead(): Promise<void> {
    await apiClient.patch<{ success: boolean }>('/notifications/read-all');
  },
};
