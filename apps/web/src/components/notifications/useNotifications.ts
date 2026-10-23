import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { notificationsApi, NotificationItem, notificationCacheKey } from '../../lib/notifications-api';
import { getNotificationSocket, disconnectNotificationSocket } from '../../lib/notification-socket';

export function useNotifications() {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const revision = useRef(0);
  const cacheKey = notificationCacheKey(user?.id);
  const readCache = useCallback((): NotificationItem[] => {
    try { return JSON.parse(localStorage.getItem(cacheKey) || '[]'); } catch { return []; }
  }, [cacheKey]);
  const saveCache = useCallback((items: NotificationItem[]) => {
    try { localStorage.setItem(cacheKey, JSON.stringify(items.slice(0, 100)));
      queueMicrotask(() => window.dispatchEvent(new StorageEvent('storage', { key: cacheKey }))); } catch {}
  }, [cacheKey]);
  useEffect(() => {
    let active = true;
    setNotifications(readCache());
    setLoading(true);
    const load = async () => {
      try {
        if (!token) return;
        const version = revision.current;
        const data = await notificationsApi.list();
        if (!active || version !== revision.current) return;
        setNotifications(previous => {
          const ids = new Set(data.map(item => item.id));
          const merged = [...previous.filter(item => item.id.startsWith('local-') && !ids.has(item.id)), ...data];
          saveCache(merged);
          return merged;
        });
      } catch { /* Keep this account's cached history while offline. */ }
      finally { if (active) setLoading(false); }
    };
    const receive = (item: NotificationItem) => {
      if (!active || (item.userId && item.userId !== user?.id)) return;
      revision.current++;
      setNotifications(previous => {
        const existing = previous.find(entry => entry.id === item.id);
        // Same delivery twice (socket + HTTP header): nothing changed
        if (existing && existing.createdAt === item.createdAt) return previous;
        // A rewritten entry (chat notification per conversation) moves to the top as unread
        const next = [{ ...item, read: false }, ...previous.filter(entry => entry.id !== item.id)];
        saveCache(next);
        return next;
      });
    };
    const local = (event: Event) => receive((event as CustomEvent<NotificationItem>).detail);
    const storage = (event: StorageEvent) => { if (event.key === cacheKey) { revision.current++; setNotifications(readCache()); } };
    const focus = () => { void load(); };
    const socket = token ? getNotificationSocket() : null;
    socket?.on('notification:new', receive);
    socket?.on('connect', focus);
    window.addEventListener('local-notification:new', local);
    window.addEventListener('storage', storage);
    window.addEventListener('focus', focus);
    void load();
    const interval = window.setInterval(focus, 30000);
    return () => {
      active = false;
      clearInterval(interval);
      socket?.off('notification:new', receive);
      socket?.off('connect', focus);
      window.removeEventListener('local-notification:new', local);
      window.removeEventListener('storage', storage);
      window.removeEventListener('focus', focus);
    };
  }, [token, user?.id, cacheKey, readCache, saveCache]);
  const mutate = useCallback(async (transform: (items: NotificationItem[]) => NotificationItem[], persist: () => Promise<void>) => {
    // Persist first: a failed server write must not look successfully saved.
    const sessionToken = localStorage.getItem('courtmate_token');
    await persist();
    if (localStorage.getItem('courtmate_token') !== sessionToken) return;
    revision.current++;
    setNotifications(previous => { const next = transform(previous); saveCache(next); return next; });
  }, [cacheKey, saveCache]);
  const markRead = (id: string) => mutate(items => items.map(item => item.id === id ? { ...item, read: true } : item), () => id.startsWith('local-') ? Promise.resolve() : notificationsApi.markRead(id));
  const markAllRead = () => mutate(items => items.map(item => ({ ...item, read: true })), () => token ? notificationsApi.markAllRead() : Promise.resolve());
  const deleteOne = (id: string) => mutate(items => items.filter(item => item.id !== id), () => id.startsWith('local-') ? Promise.resolve() : notificationsApi.deleteOne(id));
  const deleteAll = () => mutate(() => [], () => token ? notificationsApi.deleteAll() : Promise.resolve());
  return { notifications, unreadCount: notifications.filter(item => !item.read).length, loading, markRead, markAllRead, deleteOne, deleteAll, disconnectNotificationSocket };
}
