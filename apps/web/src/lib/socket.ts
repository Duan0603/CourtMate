import { io, Socket } from 'socket.io-client';
import { API_URL } from './api-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || API_URL;

let socket: Socket | null = null;
let socketToken: string | null = null;

const readToken = (): string | null => {
  try {
    return localStorage.getItem('courtmate_token');
  } catch {
    return null;
  }
};

/**
 * Chat socket authenticated with the current JWT. The server takes the user's identity
 * from the token, so the socket is recreated whenever the logged-in account changes.
 */
export const getSocket = (): Socket => {
  const token = readToken();
  if (socket && socketToken !== token) disconnectSocket();

  if (!socket) {
    socketToken = token;
    socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      // Re-read on every (re)connect so a refreshed token is used
      auth: (cb) => cb({ token: readToken() }),
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    socketToken = null;
  }
};
