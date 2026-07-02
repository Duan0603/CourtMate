import { User, UserRole } from '@courtmate/shared';

const API_URL = 'http://localhost:3000';

export const authApi = {
  requestOtp: async (email: string): Promise<void> => {
    const response = await fetch(`${API_URL}/auth/request-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `Failed to request OTP. status: ${response.status}`);
    }
  },

  verifyOtp: async (email: string, code: string): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `Failed to verify OTP. status: ${response.status}`);
    }
    return response.json();
  },

  updateProfile: async (
    token: string,
    profileData: {
      name?: string;
      role?: UserRole;
      preferences?: {
        sports?: any[];
        location?: string;
        skillLevel?: string;
        clubName?: string;
      };
    }
  ): Promise<User> => {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `Failed to update profile. status: ${response.status}`);
    }
    return response.json();
  },

  getProfile: async (token: string): Promise<User> => {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `Failed to fetch profile. status: ${response.status}`);
    }
    return response.json();
  },

  addBookmark: async (token: string, tournamentId: string): Promise<User> => {
    const response = await fetch(`${API_URL}/users/bookmarks/${tournamentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `Failed to add bookmark. status: ${response.status}`);
    }
    return response.json();
  },

  removeBookmark: async (token: string, tournamentId: string): Promise<User> => {
    const response = await fetch(`${API_URL}/users/bookmarks/${tournamentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `Failed to remove bookmark. status: ${response.status}`);
    }
    return response.json();
  },
};
