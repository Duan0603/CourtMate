export type TournamentStatus = 'pending' | 'approved' | 'rejected';
export type TicketStatus = 'open' | 'pending' | 'resolved';
export type UserStatus = 'active' | 'disabled';
export type OrganizerStatus = 'active' | 'review' | 'disabled';
export type ReportPriority = 'high' | 'medium' | 'low';

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

export interface OrganizerRecord {
  id: string;
  name: string;
  email: string;
  sport: string;
  status: OrganizerStatus;
  registrations: number;
  revenue: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  requester: string;
  priority: 'high' | 'medium' | 'low';
  status: TicketStatus;
  createdAt: string;
}

export interface ReportRecord {
  id: string;
  title: string;
  category: string;
  owner: string;
  priority: ReportPriority;
  date: string;
}

export interface AdminDashboardData {
  tournamentApprovals: TournamentApproval[];
  adminActivity: AdminActivityLog[];
  users: UserRecord[];
  organizers: OrganizerRecord[];
  supportTickets: SupportTicket[];
  reports: ReportRecord[];
}

export const initialAdminDashboardData: AdminDashboardData = {
  tournamentApprovals: [
    {
      id: 'approval-1',
      name: 'Mở cửa mùa hè 2026',
      organization: 'Câu lạc bộ quần vợt thung lũng sông',
      sport: 'Quần vợt',
      submitted: '2 giờ trước',
      status: 'pending',
    },
    {
      id: 'approval-2',
      name: 'Classic Pickleball Thành phố',
      organization: 'Hiệp hội thể thao đô thị',
      sport: 'Pickleball',
      submitted: '5 giờ trước',
      status: 'pending',
    },
    {
      id: 'approval-3',
      name: 'Cúp cầu lông thiếu niên',
      organization: 'Đà Nẵng BC',
      sport: 'Cầu lông',
      submitted: '1 ngày trước',
      status: 'approved',
    },
  ],
  adminActivity: [
    {
      id: 'activity-1',
      time: '14:32',
      admin: 'Sarah J.',
      action: 'Duyệt giải đấu',
      target: 'Mở cửa mùa hè 2026',
      status: 'approved',
    },
    {
      id: 'activity-2',
      time: '13:15',
      admin: 'John S.',
      action: 'Vô hiệu hóa tài khoản người dùng',
      target: 'spam_user_42',
      status: 'rejected',
    },
    {
      id: 'activity-3',
      time: '11:05',
      admin: 'Hệ thống',
      action: 'Tự động gắn cờ nội dung',
      target: 'Hình ảnh giải đấu không phù hợp',
      status: 'urgent',
    },
  ],
  users: [
    {
      id: 'user-1',
      name: 'Nguyễn Minh An',
      email: 'minhan@example.com',
      role: 'Player',
      status: 'active',
      lastActive: '5 phút trước',
      region: 'Hà Nội',
    },
    {
      id: 'user-2',
      name: 'Trần Bảo Vy',
      email: 'baovy@example.com',
      role: 'Organizer',
      status: 'active',
      lastActive: '20 phút trước',
      region: 'Đà Nẵng',
    },
    {
      id: 'user-3',
      name: 'Lê Đức Tài',
      email: 'ductai@example.com',
      role: 'Player',
      status: 'disabled',
      lastActive: '2 giờ trước',
      region: 'TP.HCM',
    },
  ],
  organizers: [
    {
      id: 'organizer-1',
      name: 'Câu lạc bộ quần vợt thung lũng sông',
      email: 'river@example.com',
      sport: 'Quần vợt',
      status: 'active',
      registrations: 84,
      revenue: 42800,
    },
    {
      id: 'organizer-2',
      name: 'Hiệp hội thể thao đô thị',
      email: 'metro@example.com',
      sport: 'Pickleball',
      status: 'review',
      registrations: 41,
      revenue: 18300,
    },
    {
      id: 'organizer-3',
      name: 'Đà Nẵng BC',
      email: 'danangbc@example.com',
      sport: 'Cầu lông',
      status: 'disabled',
      registrations: 19,
      revenue: 9200,
    },
  ],
  supportTickets: [
    {
      id: 'ticket-1',
      subject: 'Không thể đăng ký giải đấu',
      requester: 'Nguyễn A',
      priority: 'high',
      status: 'open',
      createdAt: '30 phút trước',
    },
    {
      id: 'ticket-2',
      subject: 'Cập nhật thông tin tổ chức',
      requester: 'Trần B',
      priority: 'medium',
      status: 'pending',
      createdAt: '1 giờ trước',
    },
    {
      id: 'ticket-3',
      subject: 'Yêu cầu khôi phục tài khoản',
      requester: 'Lê C',
      priority: 'low',
      status: 'resolved',
      createdAt: '3 giờ trước',
    },
  ],
  reports: [
    {
      id: 'report-1',
      title: 'Báo cáo tăng trưởng người dùng',
      category: 'Người dùng',
      owner: 'Minh',
      priority: 'high',
      date: '2026-07-18',
    },
    {
      id: 'report-2',
      title: 'Tóm tắt doanh thu tháng',
      category: 'Doanh thu',
      owner: 'Vy',
      priority: 'medium',
      date: '2026-07-17',
    },
    {
      id: 'report-3',
      title: 'Phân tích đăng ký giải đấu',
      category: 'Giải đấu',
      owner: 'Tài',
      priority: 'low',
      date: '2026-07-16',
    },
  ],
};

export function getDashboardMetrics(data: AdminDashboardData) {
  const pendingApprovals = data.tournamentApprovals.filter((item) => item.status === 'pending').length;
  const approvedApprovals = data.tournamentApprovals.filter((item) => item.status === 'approved').length;
  const rejectedApprovals = data.tournamentApprovals.filter((item) => item.status === 'rejected').length;
  const activeOrganizers = data.organizers.filter((item) => item.status === 'active').length;
  const openTickets = data.supportTickets.filter((item) => item.status !== 'resolved').length;
  const urgentTickets = data.supportTickets.filter((item) => item.priority === 'high' || item.status === 'pending').length;
  const totalRevenue = data.organizers.reduce((total, item) => total + item.revenue, 0);

  return {
    totalUsers: data.users.length,
    activeOrganizers,
    globalRevenue: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(totalRevenue),
    supportTickets: data.supportTickets.length,
    pendingApprovals,
    approvedApprovals,
    rejectedApprovals,
    openTickets,
    urgentTickets,
  };
}
