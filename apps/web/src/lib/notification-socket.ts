import { io, Socket } from 'socket.io-client';
import { API_URL } from './api-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || API_URL;

let socket: Socket | null = null;

/**
 * Get or create a singleton Socket.IO connection to the /notifications namespace.
 * Reads token from localStorage. Only runs client-side.
 */
export const getNotificationSocket = (): Socket | null => {
  if (typeof window === 'undefined') return null;

  if (socket?.connected) return socket;

  const token = localStorage.getItem('courtmate_token');
  if (!token) return null;

  // Disconnect existing stale socket before creating a new one
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(`${WS_URL}/notifications`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  return socket;
};

/**
 * Disconnect the notification socket. Call on logout or user change.
 */
export const disconnectNotificationSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
