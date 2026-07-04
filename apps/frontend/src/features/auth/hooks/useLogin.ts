import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
        const storedToken = await AsyncStorage.getItem('courtmate_jwt_token');
        if (storedToken) {
          const profile = await authApi.getProfile(storedToken);
          setToken(storedToken);
          setUser(profile);
        }
      } catch (error) {
        console.error('Error loading token from AsyncStorage:', error);
        try {
          await AsyncStorage.removeItem('courtmate_jwt_token');
        } catch (_) {}
      } finally {
        setIsLoading(false);
      }
    }
    loadToken();
  }, []);

  const requestOtp = async (email: string) => {
    await authApi.requestOtp(email);
  };

  const verifyOtp = async (email: string, code: string) => {
    const response = await authApi.verifyOtp(email, code);
    await AsyncStorage.setItem('courtmate_jwt_token', response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const updateProfile = async (profileData: any) => {
    if (!token) throw new Error('Not authenticated');
    const updatedUser = await authApi.updateProfile(token, profileData);
    setUser(updatedUser);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('courtmate_jwt_token');
    setToken(null);
    setUser(null);
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

