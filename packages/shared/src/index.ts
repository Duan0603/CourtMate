// Shared types and constants for CourtMate

export enum SportType {
  BADMINTON = 'BADMINTON',
  FOOTBALL = 'FOOTBALL',
  PICKLEBALL = 'PICKLEBALL',
  TENNIS = 'TENNIS',
}

export enum ActivityType {
  MATCHMAKING = 'MATCHMAKING',
  RECRUITMENT = 'RECRUITMENT',
  GENERAL = 'GENERAL',
}

export enum UserRole {
  USER = 'USER',
  PLAYER = 'PLAYER',
  ORGANIZER = 'ORGANIZER',
  REGIONAL_ADMIN = 'REGIONAL_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface UserPreferences {
  sports: SportType[];
  location?: string; // e.g. "Da Nang", "Ha Noi", "Ho Chi Minh"
  skillLevel?: string; // e.g. "Beginner", "Intermediate", "Advanced"
  clubName?: string; // e.g. "Da Nang Badminton Club"
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  preferences: UserPreferences;
  bookmarkedTournaments?: string[];
  isVerified: boolean;
  createdAt: Date;
}

export interface FeedItem {
  id: string;
  title: string;
  content: string;
  sport: SportType;
  activityType: ActivityType;
  location: string; // Hyper-local region, e.g. "Son Tra, Da Nang"
  city: string; // e.g. "Da Nang"
  author: {
    id: string;
    name: string;
    isVerified: boolean;
  };
  reportsCount: number;
  isHidden: boolean;
  isExpired: boolean;
  createdAt: Date;
}

export enum TournamentStatus {
  UPCOMING = 'UPCOMING',
  OPEN = 'OPEN',
  FULL = 'FULL',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export interface TournamentCategory {
  id: string;
  name: string; // e.g., "Men's Singles", "Mixed Doubles"
  fee: number; // in VND
  maxParticipants?: number;
}

export interface Tournament {
  id: string;
  title: string;
  description: string;
  sport: SportType;
  coverImage?: string; // URL to the image
  startDate: Date;
  endDate: Date;
  location: string; // Specific venue/address
  district?: string; // e.g., "Son Tra"
  city: string; // e.g., "Da Nang"
  organizer: {
    id: string;
    name: string;
    avatar?: string;
    isVerified: boolean;
  };
  status: TournamentStatus;
  rulesText?: string;
  rulesFileUrl?: string;
  rules?: string;
  categories: TournamentCategory[];
  registrationFee?: number;
  slotsLimit?: number;
  schedule?: string[]; // Basic array of strings for schedule items
  registrationLink?: string;
  reportsCount: number;
  isHidden: boolean;
  createdAt: Date;
}

export interface CreateTournamentDto {
  title: string;
  description: string;
  sport: SportType;
  time: string;
  location: string;
  city: string;
  categories: {
    name: string;
    fee: number;
    maxParticipants?: number;
  }[];
  rulesText?: string;
  // rulesFile will be handled as multipart/form-data on the backend
}

export interface CreateReportDto {
  targetId: string; // FeedItem id or Tournament id
  targetType: 'FEED_ITEM' | 'TOURNAMENT';
  reason: string;
  notes?: string;
}

// --- Phase 8: Multi-Region & Admin ---

export enum ProfileType {
  PLAYER = 'PLAYER',
  ORGANIZER = 'ORGANIZER',
}

export enum ModerationAction {
  HIDE = 'HIDE',
  UNHIDE = 'UNHIDE',
  FEATURE = 'FEATURE',
  UNFEATURE = 'UNFEATURE',
  VERIFY_ORGANIZER = 'VERIFY_ORGANIZER',
  REVOKE_VERIFICATION = 'REVOKE_VERIFICATION',
}

export const SUPPORTED_CITIES = ['Da Nang', 'Ha Noi', 'Ho Chi Minh'] as const;
export type SupportedCity = (typeof SUPPORTED_CITIES)[number];

export interface RegionConfig {
  city: SupportedCity;
  displayName: string;
  isActive: boolean;
}

export const REGION_CONFIGS: RegionConfig[] = [
  { city: 'Da Nang', displayName: 'Đà Nẵng', isActive: true },
  { city: 'Ha Noi', displayName: 'Hà Nội', isActive: true },
  { city: 'Ho Chi Minh', displayName: 'TP. Hồ Chí Minh', isActive: true },
];

export interface AdminStats {
  city: string;
  totalTournaments: number;
  activeTournaments: number;
  totalUsers: number;
  totalRegistrations: number;
  pendingReports: number;
  tournamentsBySport: Record<string, number>;
}

export interface ModerationRecord {
  targetId: string;
  targetType: 'TOURNAMENT' | 'USER';
  action: ModerationAction;
  adminId: string;
  reason: string;
  timestamp: Date;
}
