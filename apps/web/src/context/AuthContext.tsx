'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, UserRole } from '@courtmate/shared';
import { authApi } from '../lib/auth.api';
import { disconnectSocket } from '../lib/socket';
import { disconnectNotificationSocket } from '../lib/notification-socket';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: UserRole, organizer?: { certificateUrl?: string; sports: string[] }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  toggleBookmark: (tournamentId: string) => Promise<boolean>;
  toggleCoachFavorite: (coachId: string) => Promise<boolean>;
  switchRole: (role: UserRole) => Promise<void> | void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeUser = (u: any): User | null => {
  if (!u) return null;
  return {
    ...u,
    id: u.id || u._id,
    avatarUrl: u.avatarUrl || u.preferences?.avatarUrl || undefined,
    preferences: {
      ...(u.preferences || {}),
      avatarUrl: u.avatarUrl || u.preferences?.avatarUrl || undefined,
    },
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const pendingFavorites = useRef(new Set<string>());

  useEffect(() => {
    let active = true;
    let refreshing = false;
    const refreshProfile = async () => {
      const sessionToken = localStorage.getItem('courtmate_token');
      if (!sessionToken || refreshing || pendingFavorites.current.size) return;
      refreshing = true;
      try {
        const profile = normalizeUser(await authApi.getProfile());
        if (active && profile && !pendingFavorites.current.size && localStorage.getItem('courtmate_token') === sessionToken) {
          setUser(profile);
          localStorage.setItem('courtmate_user', JSON.stringify(profile));
        }
      } catch (error: any) {
        if (active && error.status === 401 && localStorage.getItem('courtmate_token') === sessionToken) {
          setToken(null); setUser(null);
          localStorage.removeItem('courtmate_token'); localStorage.removeItem('courtmate_user');
          // The socket was authenticated at handshake and would keep receiving the old account's messages
          disconnectSocket();
          disconnectNotificationSocket();
        }
      } finally { refreshing = false; }
    };
    try {
      const storedToken = localStorage.getItem('courtmate_token');
      const storedUser = localStorage.getItem('courtmate_user');
      if (storedToken && storedToken !== 'mock-jwt-token' && storedUser) {
        setToken(storedToken);
        setUser(normalizeUser(JSON.parse(storedUser)));
        void refreshProfile();
      } else {
        localStorage.removeItem('courtmate_token'); localStorage.removeItem('courtmate_user');
      }
    } catch { setToken(null); setUser(null); }
    setIsLoading(false);
    const onVisible = () => { if (document.visibilityState === 'visible') void refreshProfile(); };
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      active = false;
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      const normalized = normalizeUser(res.user);
      setUser(normalized);
      setToken(res.token);
      localStorage.setItem('courtmate_token', res.token);
      localStorage.setItem('courtmate_user', JSON.stringify(normalized));
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.googleLogin(idToken);
      const normalized = normalizeUser(res.user);
      setUser(normalized);
      setToken(res.token);
      localStorage.setItem('courtmate_token', res.token);
      localStorage.setItem('courtmate_user', JSON.stringify(normalized));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole = UserRole.PLAYER, organizer?: { certificateUrl?: string; sports: string[] }) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(email, password, name, role, organizer);
      const normalized = normalizeUser(res.user);
      setUser(normalized);
      setToken(res.token);
      localStorage.setItem('courtmate_token', res.token);
      localStorage.setItem('courtmate_user', JSON.stringify(normalized));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('courtmate_token');
    localStorage.removeItem('courtmate_user');
    disconnectSocket();
    disconnectNotificationSocket();
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    try {
      const updated = await authApi.updateProfile(data);
      const normalized = normalizeUser(updated);
      setUser(normalized);
      localStorage.setItem('courtmate_user', JSON.stringify(normalized));
    } catch (error) {
      console.warn('Backend updateProfile failed, falling back to local update');
      const updatedUser = normalizeUser({ ...user, ...data });
      setUser(updatedUser);
      localStorage.setItem('courtmate_user', JSON.stringify(updatedUser));
    }
  };

  const toggleFavorite = async (id: string, field: 'bookmarkedTournaments' | 'bookmarkedCoaches'): Promise<boolean> => {
    if (!user || !token) return false;
    const requestKey = user.id + ':' + field + ':' + id;
    const before = user[field] || [];
    const wasFavorite = before.includes(id);
    if (pendingFavorites.current.has(requestKey)) return wasFavorite;
    pendingFavorites.current.add(requestKey);
    const sessionToken = token;
    const userId = user.id;
    const setFavorite = (selected: boolean) => setUser(previous => {
      if (!previous || previous.id !== userId || localStorage.getItem('courtmate_token') !== sessionToken) return previous;
      const current = previous[field] || [];
      const list = selected ? [...new Set([...current, id])] : current.filter(item => item !== id);
      const updated = { ...previous, [field]: list };
      localStorage.setItem('courtmate_user', JSON.stringify(updated));
      return updated;
    });
    setFavorite(!wasFavorite);
    try {
      if (field === 'bookmarkedCoaches') {
        await (wasFavorite ? authApi.removeCoachBookmark(id) : authApi.addCoachBookmark(id));
      } else {
        await (wasFavorite ? authApi.removeBookmark(id) : authApi.addBookmark(id));
      }
      return !wasFavorite;
    } catch {
      setFavorite(wasFavorite);
      toast.error('Không thể lưu yêu thích. Vui lòng thử lại.');
      return wasFavorite;
    } finally { pendingFavorites.current.delete(requestKey); }
  };
  const toggleBookmark = (id: string) => toggleFavorite(id, 'bookmarkedTournaments');
  const toggleCoachFavorite = (id: string) => toggleFavorite(id, 'bookmarkedCoaches');

  const switchRole = async (role: UserRole) => {
    try {
      if (role === UserRole.ORGANIZER) {
        const res = await authApi.login('organizer@courtmate.com', 'Password123');
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('courtmate_token', res.token);
        localStorage.setItem('courtmate_user', JSON.stringify(res.user));
        return;
      } else if (role === UserRole.SUPER_ADMIN) {
        const res = await authApi.login('superadmin@courtmate.com', 'Password123');
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('courtmate_token', res.token);
        localStorage.setItem('courtmate_user', JSON.stringify(res.user));
        return;
      } else if (role === UserRole.PLAYER) {
        const res = await authApi.login('test@courtmate.com', 'Password123');
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('courtmate_token', res.token);
        localStorage.setItem('courtmate_user', JSON.stringify(res.user));
        return;
      }
    } catch {
      // Fallback to client-side state update if offline
    }
    if (!user) return;
    const updated = { ...user, role };
    setUser(updated);
    localStorage.setItem('courtmate_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
        toggleBookmark,
        toggleCoachFavorite,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
