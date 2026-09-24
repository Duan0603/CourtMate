import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationsApi, NotificationItem } from '../../lib/notifications-api';
import { getNotificationSocket, disconnectNotificationSocket } from '../../lib/notification-socket';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const computeUnreadCount = useCallback((items: NotificationItem[]) => {
    return items.filter((n) => !n.read).length;
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await notificationsApi.list();
      if (!mountedRef.current) return;
      setNotifications(data);
      setUnreadCount(computeUnreadCount(data));
    } catch (error) {
      console.error('[useNotifications] Failed to load notifications:', error);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [computeUnreadCount]);

  useEffect(() => {
    mountedRef.current = true;
    loadNotifications();

    const socket = getNotificationSocket();
    if (!socket) {
      setLoading(false);
      return;
    }

    const handleNewNotification = (payload: any) => {
      if (!mountedRef.current) return;
      const newItem: NotificationItem = {
        id: payload.id,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        link: payload.link,
        userId: payload.userId,
        createdAt: payload.createdAt,
        read: false,
      };

      setNotifications((prev) => {
        // Deduplicate by id (prevents doubles on reconnect)
        if (prev.some((n) => n.id === newItem.id)) return prev;
        return [newItem, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification:new', handleNewNotification);

    // On reconnect, reload history to catch missed notifications
    const handleReconnect = () => {
      loadNotifications();
    };
    socket.io.on('reconnect', handleReconnect);

    return () => {
      mountedRef.current = false;
      socket.off('notification:new', handleNewNotification);
      socket.io.off('reconnect', handleReconnect);
    };
  }, [loadNotifications]);

  const markRead = useCallback(async (notificationId: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationsApi.markRead(notificationId);
    } catch (error) {
      console.error('[useNotifications] Failed to mark read:', error);
      // Reload to restore correct state
      loadNotifications();
    }
  }, [loadNotifications]);

  const markAllRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await notificationsApi.markAllRead();
    } catch (error) {
      console.error('[useNotifications] Failed to mark all read:', error);
      loadNotifications();
    }
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    disconnectNotificationSocket,
  };
}
