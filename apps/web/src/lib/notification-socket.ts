import { io, Socket } from 'socket.io-client';
import { API_URL } from './api-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || API_URL;

let socket: Socket | null = null;
let socketToken: string | null = null;

/**
 * Get or create a singleton Socket.IO connection to the /notifications namespace.
 * Reads token from localStorage. Only runs client-side.
 */
export const getNotificationSocket = (): Socket | null => {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('courtmate_token');
  if (!token) { disconnectNotificationSocket(); return null; }
  if (socket && socketToken === token) return socket;
  socketToken = token;

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
  socketToken = null;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
