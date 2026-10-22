import {
  CoachProfile,
  CoachCourse,
  CoachBooking,
  CoachReview,
  SportType,
  CoachVerificationStatus,
} from '@courtmate/shared';
import { apiClient } from './api-client';

export interface CoachFilters {
  sport?: SportType;
  city?: string;
  keyword?: string;
  minRating?: number;
  maxRate?: number;
}

export const coachesApi = {
  /**
   * Lấy danh sách Huấn luyện viên (đã duyệt)
   */
  async getCoaches(filters?: CoachFilters): Promise<CoachProfile[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.sport) params.append('sport', filters.sport);
      if (filters?.city && filters.city !== 'Tất cả') params.append('city', filters.city);
      if (filters?.keyword) params.append('keyword', filters.keyword);
      if (filters?.minRating) params.append('minRating', filters.minRating.toString());
      if (filters?.maxRate) params.append('maxRate', filters.maxRate.toString());

      const query = params.toString() ? `?${params.toString()}` : '';
      const result = await apiClient.get<CoachProfile[]>(`/coaches${query}`);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching coaches:', error);
      return [];
    }
  },

  /**
   * Lấy chi tiết hồ sơ HLV kèm reviews và khoá học mở
   */
  async getCoachDetails(id: string): Promise<CoachProfile | null> {
    try {
      const result = await apiClient.get<CoachProfile>(`/coaches/${id}`);
      return result;
    } catch (error) {
      console.error(`Error fetching coach ${id}:`, error);
      return null;
    }
  },

  /**
   * Lấy danh sách khoá học mở
   */
  async getCourses(sport?: SportType, city?: string): Promise<CoachCourse[]> {
    try {
      const params = new URLSearchParams();
      if (sport) params.append('sport', sport);
      if (city && city !== 'Tất cả') params.append('city', city);
      const query = params.toString() ? `?${params.toString()}` : '';
      const result = await apiClient.get<CoachCourse[]>(`/coaches/courses${query}`);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  },

  /**
   * Gửi đơn đăng ký trở thành Huấn luyện viên
   */
  async registerAsCoach(data: Partial<CoachProfile>): Promise<CoachProfile> {
    return apiClient.post<CoachProfile>('/coaches/register', data);
  },

  /**
   * Đặt lịch thuê HLV hoặc đăng ký khoá học
   */
  async bookCoach(coachId: string, bookingData: any): Promise<CoachBooking> {
    return apiClient.post<CoachBooking>(`/coaches/${coachId}/book`, bookingData);
  },

  /**
   * Lấy danh sách lịch thuê của học viên hiện tại
   */
  async getMyBookings(userId?: string): Promise<CoachBooking[]> {
    try {
      const query = userId ? `?userId=${userId}` : '';
      const result = await apiClient.get<CoachBooking[]>(`/coaches/bookings/my${query}`);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  },

  /**
   * Đánh giá HLV sau buổi học
   */
  async submitReview(coachId: string, reviewData: any): Promise<CoachReview> {
    return apiClient.post<CoachReview>(`/coaches/${coachId}/reviews`, reviewData);
  },

  /**
   * Admin duyệt HLV
   */
  async verifyCoach(coachId: string, status: CoachVerificationStatus): Promise<CoachProfile> {
    return apiClient.patch<CoachProfile>(`/coaches/${coachId}/verify`, { status });
  },
};
