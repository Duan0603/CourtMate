export type TournamentStatus = 'active' | 'completed' | 'draft';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected';
export type CourtStatus = 'available' | 'occupied' | 'maintenance';

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
  courts: CourtItem[];
  reports: ReportItem[];
  profile: OrganizerProfile;
}

export const initialOrganizerDashboardData: OrganizerDashboardData = {
  tournaments: [],
  registrations: [],
  courts: [],
  reports: [],
  profile: {
    name: 'Ban Tổ Chức Giải Đấu',
    logo: '',
    description: 'Chưa có thông tin giới thiệu.',
    contactEmail: '',
    phone: '',
    location: 'Đà Nẵng',
  },
};

export function getOrganizerMetrics(data: OrganizerDashboardData) {
  const activeTournaments = data.tournaments.filter((item) => item.status === 'active').length;
  const pendingRegistrations = data.registrations.filter((item) => item.status === 'pending').length;
  const totalParticipants = data.tournaments.reduce((sum, item) => sum + (item.registrations || 0), 0);

  return {
    activeTournaments,
    pendingRegistrations,
    totalParticipants,
    monthlyRevenue: '0 ₫',
  };
}
