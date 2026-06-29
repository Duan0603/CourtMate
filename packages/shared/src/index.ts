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

export interface TournamentCategory {
  id: string;
  name: string;
  fee: number;
  maxParticipants?: number;
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
  rulesText?: string;
  rulesFileUrl?: string;
  categories: TournamentCategory[];
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
