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

export function notificationCacheKey(userId?: string) {
  return 'courtmate_notifications_' + (userId || 'guest');
}

export async function emitUserNotification(item: { type: string; title: string; body: string; link?: string }) {
  if (typeof window === 'undefined') return;
  let userId: string | null = null;
  try { const user = JSON.parse(localStorage.getItem('courtmate_user') || 'null'); userId = user?.id || user?._id || null; } catch {}
  const token = localStorage.getItem('courtmate_token');
  const payload: NotificationItem = { ...item, id: 'local-' + crypto.randomUUID(), userId, createdAt: new Date().toISOString(), read: false };
  let result = payload;
  if (token) {
    try { result = await notificationsApi.create(item); } catch { /* Preserve in this account's cache during an outage. */ }
    if (localStorage.getItem('courtmate_token') !== token) return;
  }
  try {
    const key = notificationCacheKey(userId || undefined);
    const list: NotificationItem[] = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([result, ...list.filter(existing => existing.id !== result.id)].slice(0, 100)));
  } catch {}
  window.dispatchEvent(new CustomEvent('local-notification:new', { detail: result }));
  return result;
}

export const emitFavoriteNotification = emitUserNotification;
