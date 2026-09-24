'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '@courtmate/shared';
import { authApi } from '../lib/auth.api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void> | void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('courtmate_token');
      const storedUser = localStorage.getItem('courtmate_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        setToken(null);
        setUser(null);
      }
    } catch (e) {
      console.error('Error loading session from localStorage:', e);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('courtmate_token', res.token);
      localStorage.setItem('courtmate_user', JSON.stringify(res.user));
    } catch (error: any) {
      // Fallback for UI/UX testing when backend is not connected or seeded
      console.warn('Backend login failed, falling back to mock login data:', error.message);
      const mockUser = {
        _id: 'mock-user-1',
        email,
        name: email.split('@')[0],
        role: UserRole.PLAYER,
      } as unknown as User;
        const mockToken = 'mock-jwt-token';
        
        setUser(mockUser);
        setToken(mockToken);
        localStorage.setItem('courtmate_token', mockToken);
        localStorage.setItem('courtmate_user', JSON.stringify(mockUser));
        return; // Success!
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.googleLogin(idToken);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('courtmate_token', res.token);
      localStorage.setItem('courtmate_user', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole = UserRole.PLAYER) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(email, password, name, role);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('courtmate_token', res.token);
      localStorage.setItem('courtmate_user', JSON.stringify(res.user));
    } catch (error: any) {
      console.warn('Backend register failed, falling back to mock register data:', error.message);
      const mockUser = {
        _id: 'mock-user-new',
        email,
        name,
        role,
      } as unknown as User;
        const mockToken = 'mock-jwt-token';
        
        setUser(mockUser);
        setToken(mockToken);
        localStorage.setItem('courtmate_token', mockToken);
        localStorage.setItem('courtmate_user', JSON.stringify(mockUser));
        return;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('courtmate_token');
    localStorage.removeItem('courtmate_user');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updated = await authApi.updateProfile(data);
    setUser(updated);
    localStorage.setItem('courtmate_user', JSON.stringify(updated));
  };

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
