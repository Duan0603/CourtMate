import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/auth.api';
import { User, UserRole } from '@courtmate/shared';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requestOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
  mockGoogleLogin: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
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
          if (storedToken === 'mock_google_jwt_token') {
            const mockUserStr = await AsyncStorage.getItem('courtmate_mock_user');
            if (mockUserStr) {
              setUser(JSON.parse(mockUserStr));
            } else {
              setUser({
                id: 'google_mock_user',
                email: 'mockgoogle@gmail.com',
                name: 'Google User',
                role: UserRole.USER,
                isEmailVerified: true
              } as any);
            }
            setToken(storedToken);
          } else {
            const profile = await authApi.getProfile(storedToken);
            setToken(storedToken);
            setUser(profile);
          }
        }
      } catch (error) {
        console.error('Error loading token from AsyncStorage:', error);
        try {
          await AsyncStorage.removeItem('courtmate_jwt_token');
          await AsyncStorage.removeItem('courtmate_mock_user');
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

    if (token === 'mock_google_jwt_token') {
      const updatedUser = { ...user, ...profileData };
      await AsyncStorage.setItem('courtmate_mock_user', JSON.stringify(updatedUser));
      setUser(updatedUser as any);
      return;
    }

    const updatedUser = await authApi.updateProfile(token, profileData);
    setUser(updatedUser);
  };

  const mockGoogleLogin = async () => {
    const fakeToken = 'mock_google_jwt_token';
    const fakeUser = {
      id: 'google_mock_user',
      email: 'mockgoogle@gmail.com',
      name: 'Google User',
      role: UserRole.USER,
      isEmailVerified: true
    };
    await AsyncStorage.setItem('courtmate_jwt_token', fakeToken);
    await AsyncStorage.setItem('courtmate_mock_user', JSON.stringify(fakeUser));
    setToken(fakeToken);
    setUser(fakeUser as any);
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    await AsyncStorage.setItem('courtmate_jwt_token', response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await authApi.register(email, password, name);
    await AsyncStorage.setItem('courtmate_jwt_token', response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      console.log('[AuthContext] Attempting to logout...');
      await AsyncStorage.removeItem('courtmate_jwt_token');
      await AsyncStorage.removeItem('courtmate_mock_user');
      setToken(null);
      setUser(null);
      console.log('[AuthContext] Logout successful. Tokens removed and state reset.');
    } catch (e) {
      console.error('[AuthContext] Error during logout:', e);
      throw e;
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
        mockGoogleLogin,
        login,
        register,
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

