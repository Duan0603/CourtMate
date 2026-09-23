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
  switchRole: (role: UserRole) => void;
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

  const switchRole = (role: UserRole) => {
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
