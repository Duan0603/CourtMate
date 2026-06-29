import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../services/auth.api';
import { User } from '@courtmate/shared';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requestOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadToken() {
      try {
        const storedToken = await SecureStore.getItemAsync('courtmate_jwt_token');
        if (storedToken) {
          const profile = await authApi.getProfile(storedToken);
          setToken(storedToken);
          setUser(profile);
        }
      } catch (error) {
        console.error('Error loading token from SecureStore:', error);
        try {
          await SecureStore.deleteItemAsync('courtmate_jwt_token');
        } catch (_) {}
      } finally {
        setIsLoading(false);
      }
    }
    loadToken();
  }, []);

  const requestOtp = async (email: string) => {
    setIsLoading(true);
    try {
      await authApi.requestOtp(email);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.verifyOtp(email, code);
      await SecureStore.setItemAsync('courtmate_jwt_token', response.token);
      setToken(response.token);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: any) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    try {
      const updatedUser = await authApi.updateProfile(token, profileData);
      setUser(updatedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await SecureStore.deleteItemAsync('courtmate_jwt_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = !!token && !!user;

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        token,
        isAuthenticated,
        isLoading,
        requestOtp,
        verifyOtp,
        updateProfile,
        logout,
      },
    },
    children
  );
};

export function useLogin() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useLogin must be used within an AuthProvider');
  }
  return context;
}

