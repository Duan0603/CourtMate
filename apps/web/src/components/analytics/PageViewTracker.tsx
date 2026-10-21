'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { apiClient } from '../../lib/api-client';
import { getNotificationSocket } from '../../lib/notification-socket';

/**
 * Fires a page-view event on every route change: once over HTTP (persisted, feeds the
 * admin "most visited pages" stat) and once over the notifications socket, if connected
 * (live, feeds the admin "who's online, on which page" list).
 * Mounted once in the root layout; renders nothing.
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;

    apiClient.post('/analytics/page-view', { route: pathname }).catch(() => {
      // Best-effort tracking; a failed beacon must never affect the page.
    });

    const socket = getNotificationSocket();
    socket?.emit('page-view', { route: pathname });
  }, [pathname]);

  return null;
}
