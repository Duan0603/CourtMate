import { Registration, CreateRegistrationDto, RegistrationStatus } from '@courtmate/shared';
import { apiClient } from './api-client';

export const registrationsApi = {
  async create(dto: CreateRegistrationDto, playerId: string): Promise<Registration> {
    return apiClient.post<Registration>('/registrations', dto, {
      'x-player-id': playerId,
    });
  },

  async getMyRegistrations(playerId?: string): Promise<Registration[]> {
    try {
      const headers = playerId ? { 'x-player-id': playerId } : undefined;
      const res = await apiClient.get<Registration[]>('/registrations/my', headers);
      return res || [];
    } catch (e) {
      console.error('Error fetching registrations:', e);
      return [];
    }
  },

  async getRegistrationsByTournament(tournamentId: string): Promise<Registration[]> {
    try {
      const res = await apiClient.get<Registration[]>(`/registrations/tournament/${tournamentId}`);
      return res || [];
    } catch (e) {
      console.error('Error fetching tournament registrations:', e);
      return [];
    }
  },

  async updateStatus(id: string, status: RegistrationStatus): Promise<Registration> {
    return apiClient.patch<Registration>(`/registrations/${id}/status`, { status });
  },
};
