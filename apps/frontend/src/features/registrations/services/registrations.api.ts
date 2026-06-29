import { Registration, CreateRegistrationDto, RegistrationStatus } from '@courtmate/shared';
import { apiClient } from '../../../services/api-client';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const registrationsApi = {
  create: async (dto: CreateRegistrationDto, playerId: string): Promise<Registration> => {
    const url = `${BASE_URL}/registrations`;
    try {
      return await apiClient.post<Registration>(url, dto, {
        'x-player-id': playerId,
      });
    } catch (e: any) {
      throw new Error(e.message || 'Đăng ký thất bại');
    }
  },

  getMyRegistrations: async (playerId: string): Promise<Registration[]> => {
    const url = `${BASE_URL}/registrations/my`;
    try {
      return await apiClient.get<Registration[]>(url, {
        'x-player-id': playerId,
      });
    } catch (e: any) {
      throw new Error(e.message || 'Không thể lấy danh sách đăng ký');
    }
  },

  updateStatus: async (id: string, status: RegistrationStatus): Promise<Registration> => {
    const url = `${BASE_URL}/registrations/${id}/status`;
    try {
      return await apiClient.patch<Registration>(url, { status });
    } catch (e: any) {
      throw new Error(e.message || 'Cập nhật trạng thái thất bại');
    }
  },
};
