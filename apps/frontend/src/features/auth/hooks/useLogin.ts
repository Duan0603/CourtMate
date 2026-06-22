import { useState } from 'react';
import { authApi } from '../services/auth.api';
import { AuthState } from '../types';

export function useLogin() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const login = async (email: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await authApi.login(email);
      setState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return response;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  return {
    ...state,
    login,
  };
}
