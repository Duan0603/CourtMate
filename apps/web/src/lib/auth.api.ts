import { User, UserRole } from '@courtmate/shared';
import { apiClient } from './api-client';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', { email, password });
  },

  async register(email: string, password: string, name: string, role: UserRole = UserRole.PLAYER): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', { email, password, name, role });
  },

  async googleLogin(idToken: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/google', { idToken });
  },

  async getProfile(): Promise<User> {
    return apiClient.get<User>('/users/profile');
  },

  async updateProfile(profileData: Partial<User>): Promise<User> {
    return apiClient.put<User>('/users/profile', profileData);
  },

  async getFriends(): Promise<User[]> {
    try {
      const friends = await apiClient.get<User[]>('/users/friends');
      return friends || [];
    } catch {
      return [];
    }
  },
};
