export type TournamentStatus = 'pending' | 'approved' | 'rejected';
export type UserStatus = 'active' | 'disabled';
export type TicketStatus = 'open' | 'pending' | 'resolved';

export interface TournamentApproval {
  id: string;
  name: string;
  organization: string;
  sport: string;
  submitted: string;
  status: TournamentStatus;
}

export interface AdminActivityLog {
  id: string;
  time: string;
  admin: string;
  action: string;
  target: string;
  status: 'approved' | 'rejected' | 'urgent' | 'resolved' | 'info';
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  lastActive: string;
  region: string;
}

export interface AdminDashboardData {
  tournamentApprovals: TournamentApproval[];
  adminActivity: AdminActivityLog[];
  users: UserRecord[];
}

export const initialAdminDashboardData: AdminDashboardData = {
  tournamentApprovals: [],
  adminActivity: [],
  users: [],
};

export function getAdminMetrics(data: AdminDashboardData) {
  const pendingApprovals = data.tournamentApprovals.filter((i) => i.status === 'pending').length;
  const approvedApprovals = data.tournamentApprovals.filter((i) => i.status === 'approved').length;
  const totalUsers = data.users.length;
  const activeUsers = data.users.filter((u) => u.status === 'active').length;

  return {
    pendingApprovals,
    approvedApprovals,
    totalUsers,
    activeUsers,
  };
}
