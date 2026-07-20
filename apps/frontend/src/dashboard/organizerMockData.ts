export type TournamentStatus = 'active' | 'completed' | 'draft';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected';
export type CourtStatus = 'available' | 'occupied' | 'maintenance';
export type ParticipantRole = 'player' | 'captain' | 'coach';

export interface TournamentItem {
  id: string;
  name: string;
  sport: string;
  date: string;
  registrations: number;
  status: TournamentStatus;
  description: string;
}

export interface RegistrationItem {
  id: string;
  playerName: string;
  avatar: string;
  rating: string;
  tournamentId: string;
  tournamentName: string;
  category: string;
  status: RegistrationStatus;
}

export interface ParticipantItem {
  id: string;
  name: string;
  avatar: string;
  role: ParticipantRole;
  tournamentId: string;
  tournamentName: string;
  status: RegistrationStatus;
}

export interface CourtItem {
  id: string;
  name: string;
  type: string;
  status: CourtStatus;
  nextSlot: string;
}

export interface ReportItem {
  id: string;
  title: string;
  value: string;
  detail: string;
}

export interface OrganizerProfile {
  name: string;
  logo: string;
  description: string;
  contactEmail: string;
  phone: string;
  location: string;
}

export interface OrganizerDashboardData {
  tournaments: TournamentItem[];
  registrations: RegistrationItem[];
  participants: ParticipantItem[];
  courts: CourtItem[];
  reports: ReportItem[];
  profile: OrganizerProfile;
}

export const initialOrganizerDashboardData: OrganizerDashboardData = {
  tournaments: [
    {
      id: 'tournament-1',
      name: 'Summer Open 2026',
      sport: 'Quần vợt',
      date: '12/08/2026',
      registrations: 48,
      status: 'active',
      description: 'Giải đấu quy mô lớn dành cho các tay vợt trình độ 6.0+',
    },
    {
      id: 'tournament-2',
      name: 'Club Championship',
      sport: 'Cầu lông',
      date: '24/09/2026',
      registrations: 32,
      status: 'draft',
      description: 'Giải nội bộ cho thành viên câu lạc bộ',
    },
    {
      id: 'tournament-3',
      name: 'Weekend Pickleball',
      sport: 'Pickleball',
      date: '03/10/2026',
      registrations: 19,
      status: 'completed',
      description: 'Sự kiện cuối tuần đã kết thúc thành công',
    },
  ],
  registrations: [
    {
      id: 'reg-1',
      playerName: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
      rating: 'UTR 7.2',
      tournamentId: 'tournament-1',
      tournamentName: 'Summer Open 2026',
      category: "Women's Singles A",
      status: 'pending',
    },
    {
      id: 'reg-2',
      playerName: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
      rating: 'UTR 9.1',
      tournamentId: 'tournament-1',
      tournamentName: 'Summer Open 2026',
      category: "Men's Singles Open",
      status: 'approved',
    },
    {
      id: 'reg-3',
      playerName: 'Elena Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80',
      rating: 'UTR 8.4',
      tournamentId: 'tournament-2',
      tournamentName: 'Club Championship',
      category: "Women's Doubles",
      status: 'approved',
    },
    {
      id: 'reg-4',
      playerName: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80',
      rating: 'UTR 6.8',
      tournamentId: 'tournament-1',
      tournamentName: 'Summer Open 2026',
      category: "Men's Singles B",
      status: 'pending',
    },
  ],
  participants: [
    {
      id: 'participant-1',
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
      role: 'player',
      tournamentId: 'tournament-1',
      tournamentName: 'Summer Open 2026',
      status: 'approved',
    },
    {
      id: 'participant-2',
      name: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
      role: 'captain',
      tournamentId: 'tournament-1',
      tournamentName: 'Summer Open 2026',
      status: 'approved',
    },
    {
      id: 'participant-3',
      name: 'Elena Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80',
      role: 'player',
      tournamentId: 'tournament-2',
      tournamentName: 'Club Championship',
      status: 'approved',
    },
  ],
  courts: [
    { id: 'court-1', name: 'Sân 1', type: 'Sân cứng', status: 'available', nextSlot: '09:00' },
    { id: 'court-2', name: 'Sân 2', type: 'Sân cứng', status: 'available', nextSlot: '10:00' },
    { id: 'court-3', name: 'Sân 3', type: 'Sân cứng', status: 'occupied', nextSlot: '12:00' },
    { id: 'court-4', name: 'Sân 4', type: 'Sân cứng', status: 'maintenance', nextSlot: '15:00' },
    { id: 'court-5', name: 'Sân 5', type: 'Sân đất nện', status: 'occupied', nextSlot: '11:30' },
    { id: 'court-6', name: 'Sân 6', type: 'Sân đất nện', status: 'available', nextSlot: '14:00' },
  ],
  reports: [
    { id: 'report-1', title: 'Doanh thu tháng', value: '$4,250', detail: 'Tăng 12% so với tháng trước' },
    { id: 'report-2', title: 'Tăng trưởng đăng ký', value: '+18%', detail: 'Đăng ký mới tăng mạnh trong tuần qua' },
    { id: 'report-3', title: 'Tỷ lệ tham gia', value: '84%', detail: 'Tỷ lệ người tham gia giải đấu hoạt động' },
  ],
  profile: {
    name: 'River Valley Tennis Club',
    logo: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=120&q=80',
    description: 'Câu lạc bộ quần vợt chuyên nghiệp với nhiều giải đấu trong năm.',
    contactEmail: 'contact@rivervalleyclub.com',
    phone: '+84 912 345 678',
    location: 'Đà Nẵng, Việt Nam',
  },
};

export function getOrganizerMetrics(data: OrganizerDashboardData) {
  const activeTournaments = data.tournaments.filter((item) => item.status === 'active').length;
  const pendingRegistrations = data.registrations.filter((item) => item.status === 'pending').length;
  const totalParticipants = data.participants.length;
  const totalRevenue = data.tournaments.reduce((sum, item) => sum + item.registrations * 80, 0);

  return {
    activeTournaments,
    pendingRegistrations,
    totalParticipants,
    monthlyRevenue: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(totalRevenue),
  };
}
