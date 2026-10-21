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

  async create(dto: {
    type: string;
    title: string;
    body: string;
    link?: string;
  }): Promise<NotificationItem> {
    return apiClient.post<NotificationItem>('/notifications', dto);
  },

  async markRead(notificationId: string): Promise<void> {
    await apiClient.patch<{ success: boolean }>(`/notifications/${notificationId}/read`);
  },

  async markAllRead(): Promise<void> {
    await apiClient.patch<{ success: boolean }>('/notifications/read-all');
  },

  async deleteOne(notificationId: string): Promise<void> {
    await apiClient.delete<{ success: boolean }>(`/notifications/${notificationId}`);
  },

  async deleteAll(): Promise<void> {
    await apiClient.delete<{ success: boolean }>('/notifications/all');
  },
};

/**
 * Dispatch and persist a notification when an item is added to favorites.
 */
export async function emitFavoriteNotification(item: {
  type: 'FAVORITE_COACH' | 'FAVORITE_COURSE' | 'FAVORITE_TOURNAMENT';
  title: string;
  body: string;
  link?: string;
}) {
  const payload: NotificationItem = {
    id: `fav-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: item.type,
    title: item.title,
    body: item.body,
    link: item.link,
    userId: null,
    createdAt: new Date().toISOString(),
    read: false,
  };

  // Immediate local dispatch for instantaneous UI update across tabs/components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('local-notification:new', { detail: payload }));
  }

  // Persist to backend if logged in
  try {
    const res = await notificationsApi.create({
      type: item.type,
      title: item.title,
      body: item.body,
      link: item.link,
    });
    return res;
  } catch {
    // If guest or network issue, fallback to localStorage cache
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('courtmate_guest_notifications') || '[]';
        const list = JSON.parse(stored);
        list.unshift(payload);
        localStorage.setItem('courtmate_guest_notifications', JSON.stringify(list.slice(0, 50)));
      } catch {}
    }
    return payload;
  }
}
