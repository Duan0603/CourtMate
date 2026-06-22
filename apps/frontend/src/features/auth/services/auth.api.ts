import { User } from '@courtmate/shared';

// Mock auth API service
export const authApi = {
  login: async (email: string): Promise<{ user: User; token: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            id: 'mock-user-id-123',
            email,
            name: 'Nguyen Van A',
            role: 'USER' as any,
            preferences: {
              sports: ['BADMINTON'] as any,
              location: 'Da Nang',
            },
            isVerified: true,
            createdAt: new Date(),
          },
          token: 'mock-jwt-token-xyz',
        });
      }, 1000);
    });
  },
};
