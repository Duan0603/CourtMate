import { Tournament, CreateTournamentDto, TournamentFilterDto } from '@courtmate/shared';
import { apiClient } from './api-client';

export const tournamentsApi = {
  async getTournaments(filters?: TournamentFilterDto): Promise<{ data: Tournament[]; meta: any }> {
    try {
      const params = new URLSearchParams();
      if (filters?.city && filters.city !== 'Tất cả') params.append('city', filters.city);
      if (filters?.sport && filters.sport !== ('ALL' as any)) params.append('sport', filters.sport);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.keyword) params.append('keyword', filters.keyword);
      if (filters?.minFee !== undefined) params.append('minFee', filters.minFee.toString());
      if (filters?.maxFee !== undefined) params.append('maxFee', filters.maxFee.toString());

      const query = params.toString() ? `?${params.toString()}` : '';
      const result = await apiClient.get<{ data: Tournament[]; meta: any }>(`/tournaments${query}`);
      return {
        data: result?.data || [],
        meta: result?.meta || { total: result?.data?.length || 0 },
      };
    } catch (error) {
      console.error('Error fetching tournaments from backend:', error);
      return { data: [], meta: { total: 0 } };
    }
  },

  async getTournamentDetails(id: string): Promise<Tournament | null> {
    try {
      const result = await apiClient.get<Tournament>(`/tournaments/${id}`);
      return result;
    } catch (error) {
      console.error(`Error fetching tournament ${id}:`, error);
      return null;
    }
  },

  async createTournament(data: CreateTournamentDto, coverFile?: File, rulesFile?: File): Promise<Tournament> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('sport', data.sport);
    formData.append('time', data.time || new Date().toISOString());
    formData.append('location', data.location);
    formData.append('city', data.city);
    formData.append('categories', JSON.stringify(data.categories || []));
    if (data.registrationFee) formData.append('registrationFee', String(data.registrationFee));
    if (data.slotsLimit) formData.append('slotsLimit', String(data.slotsLimit));
    if (data.rulesText) formData.append('rulesText', data.rulesText);
    if (data.coverImage) formData.append('coverImage', data.coverImage);
    if (coverFile) formData.append('coverImageFile', coverFile);
    if (rulesFile) formData.append('rulesFile', rulesFile);

    return apiClient.postFormData<Tournament>('/tournaments', formData);
  },

  async getBookmarkedTournaments(token: string, ids: string[]): Promise<Tournament[]> {
    if (!ids || ids.length === 0) return [];
    try {
      const query = `?ids=${ids.join(',')}`;
      const result = await apiClient.get<{ data: Tournament[] }>(`/tournaments/bookmarked${query}`, {
        Authorization: `Bearer ${token}`,
      });
      return result.data || [];
    } catch (error) {
      console.error('Error fetching bookmarked tournaments:', error);
      return [];
    }
  },

  async getMyOrganizedTournaments(): Promise<Tournament[]> {
    try {
      const result = await apiClient.get<{ data: Tournament[] }>('/tournaments/my-organized');
      return result.data || [];
    } catch (error) {
      console.error('Error fetching organized tournaments:', error);
      return [];
    }
  },
};
