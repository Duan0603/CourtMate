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
  REGIONAL_ADMIN = 'REGIONAL_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface UserPreferences {
  sports: SportType[];
  location?: string; // e.g. "Da Nang", "Ha Noi", "Ho Chi Minh"
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  preferences: UserPreferences;
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
  isExpired: boolean;
  createdAt: Date;
}

export interface Tournament {
  id: string;
  title: string;
  description: string;
  sport: SportType;
  time: string; // Date or friendly range
  location: string; // Specific venue
  city: string;
  organizer: {
    id: string;
    name: string;
    isVerified: boolean;
  };
  rules: string;
  registrationLink: string;
  createdAt: Date;
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
