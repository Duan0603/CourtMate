import { apiClient } from './api-client';

export interface AdminDashboardOverview {
  totalUsers: number;
  onlineUsers: number;
  totalTournaments: number;
  totalMatches: number;
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'disabled';
  location: string;
  createdAt?: string;
  isOnline: boolean;
}

export interface OrganizerRequestItem {
  id: string;
  name: string;
  email: string;
  organizerApprovalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  organizerCertificateUrl?: string;
  organizerSports?: string[];
  organizerRejectionReason?: string;
  organizerSubmittedAt?: string;
  createdAt?: string;
}

export const adminApi = {
  getOverview: async (): Promise<AdminDashboardOverview> => {
    return apiClient.get<AdminDashboardOverview>('/admin/dashboard-overview');
  },

  getUsers: async (): Promise<AdminUserItem[]> => {
    return apiClient.get<AdminUserItem[]>('/admin/users');
  },

  getTournaments: async (): Promise<any[]> => {
    return apiClient.get<any[]>('/admin/tournaments');
  },

  updateUserRole: async (userId: string, role: string): Promise<any> => {
    return apiClient.put(`/admin/users/${userId}/role`, { role });
  },

  updateUserStatus: async (userId: string, status: 'active' | 'disabled'): Promise<any> => {
    return apiClient.put(`/admin/users/${userId}/status`, { status });
  },

  moderateTournament: async (tournamentId: string, action: string): Promise<any> => {
    return apiClient.post('/admin/moderate', { tournamentId, action });
  },

  getOrganizerRequests: async (): Promise<OrganizerRequestItem[]> => {
    return apiClient.get<OrganizerRequestItem[]>('/admin/organizer-requests');
  },

  approveOrganizer: async (userId: string): Promise<any> => {
    return apiClient.put(`/admin/organizers/${userId}/approve`);
  },

  rejectOrganizer: async (userId: string, reason?: string): Promise<any> => {
    return apiClient.put(`/admin/organizers/${userId}/reject`, { reason });
  },

  reApplyOrganizer: async (data: { name?: string; certificateUrl?: string; sports?: string[] }): Promise<any> => {
    return apiClient.put('/users/re-apply-organizer', data);
  },
};
