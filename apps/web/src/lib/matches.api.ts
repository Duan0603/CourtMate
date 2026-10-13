import { Match, CreateMatchDto, MatchFilterDto, BadmintonSkillLevel } from '@courtmate/shared';
import { apiClient } from './api-client';

export const matchesApi = {
  /**
   * Lấy danh sách các kèo đang tuyển / sắp diễn ra
   */
  async getMatches(filters?: MatchFilterDto): Promise<{ data: Match[]; meta: { total: number } }> {
    try {
      const params = new URLSearchParams();
      if (filters?.sport) params.append('sport', filters.sport);
      if (filters?.city && filters.city !== 'Tất cả') params.append('city', filters.city);
      if (filters?.district && filters.district !== 'Tất cả') params.append('district', filters.district);
      if (filters?.skillLevel) params.append('skillLevel', filters.skillLevel);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.keyword) params.append('keyword', filters.keyword);
      if (filters?.date) params.append('date', filters.date);

      const query = params.toString() ? `?${params.toString()}` : '';
      const result = await apiClient.get<{ data: Match[]; meta: { total: number } }>(`/matches${query}`);
      return {
        data: result?.data || [],
        meta: result?.meta || { total: result?.data?.length || 0 },
      };
    } catch (error) {
      console.error('Error fetching matches:', error);
      return { data: [], meta: { total: 0 } };
    }
  },

  /**
   * Lấy chi tiết kèo theo ID hoặc ShareCode
   */
  async getMatchDetails(idOrCode: string): Promise<Match | null> {
    try {
      const result = await apiClient.get<Match>(`/matches/${idOrCode}`);
      return result;
    } catch (error) {
      console.error(`Error fetching match ${idOrCode}:`, error);
      return null;
    }
  },

  /**
   * Đăng kèo tìm người mới (cần đăng nhập)
   */
  async createMatch(data: CreateMatchDto): Promise<Match> {
    return apiClient.post<Match>('/matches', data);
  },

  /**
   * Tham gia giữ slot (cần đăng nhập)
   */
  async joinMatch(matchId: string, skillLevel?: BadmintonSkillLevel): Promise<Match> {
    return apiClient.post<Match>(`/matches/${matchId}/join`, { skillLevel });
  },

  /**
   * Rút lui khỏi slot (trước 2 tiếng)
   */
  async leaveMatch(matchId: string): Promise<Match> {
    return apiClient.post<Match>(`/matches/${matchId}/leave`);
  },

  /**
   * Hủy kèo (chủ kèo)
   */
  async cancelMatch(matchId: string): Promise<Match> {
    return apiClient.post<Match>(`/matches/${matchId}/cancel`);
  },
};
