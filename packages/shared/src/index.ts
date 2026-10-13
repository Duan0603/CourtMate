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
  // Profile extended fields
  username?: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  preferences: UserPreferences;
  avatarUrl?: string;
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
  matchDates?: Date[]; // Specific dates when matches are played
  registrationLink?: string;
  sourceName?: string;
  sourceUrl?: string;
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
  registrationFee?: number;
  slotsLimit?: number;
  rulesText?: string;
  coverImage?: string;
  rulesFileUrl?: string;
  matchDates?: Date[];
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

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
}

export interface Registration {
  id: string;
  tournamentId: string;
  playerId: string;
  playerName: string;
  partnerName?: string;
  contactPhone: string;
  skillLevel: SkillLevel;
  status: RegistrationStatus;
  createdAt: Date;
}

export interface CreateRegistrationDto {
  tournamentId: string;
  playerName: string;
  partnerName?: string;
  contactPhone: string;
  skillLevel: SkillLevel;
}

export interface TournamentFilterDto {
  keyword?: string;
  sport?: SportType;
  city?: string;
  minFee?: number;
  maxFee?: number;
  status?: TournamentStatus;
}

export interface PlatformFeedback {
  _id?: string;
  id?: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  userRole?: string;
  rating: number;
  comment: string;
  category?: string;
  isVerified?: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface CreatePlatformFeedbackDto {
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  userRole?: string;
  rating: number;
  comment: string;
  category?: string;
}

// ─── MATCHMAKING & BADMINTON SKILL LEVELS ─────────────────────────────────────
export enum BadmintonSkillLevel {
  YEU = 'YEU',             // Yếu / Mới chơi
  TBY = 'TBY',             // Trung bình yếu
  TB = 'TB',               // Trung bình
  TB_PLUS = 'TB_PLUS',     // Trung bình khá
  KHA = 'KHA',             // Khá
  KHA_PLUS = 'KHA_PLUS',   // Khá+ / Bán chuyên
}

export const BADMINTON_SKILL_LABELS: Record<BadmintonSkillLevel, { label: string; description: string; color: string }> = {
  [BadmintonSkillLevel.YEU]: {
    label: 'Yếu (Mới chơi)',
    description: 'Đang tập phát cầu, đánh qua lại căn bản',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  [BadmintonSkillLevel.TBY]: {
    label: 'Trung bình yếu (TBY)',
    description: 'Đã nắm luật, đánh được qua lại nhưng phản xạ còn chậm',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  [BadmintonSkillLevel.TB]: {
    label: 'Trung bình (TB)',
    description: 'Nắm vững kỹ thuật, phông/chặt/đập ổn định, hiểu ý đồng đội',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  [BadmintonSkillLevel.TB_PLUS]: {
    label: 'Trung bình khá (TB+)',
    description: 'Lực cổ tay tốt, bao sân nhanh, bắt lưới và tấn công tốt',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  [BadmintonSkillLevel.KHA]: {
    label: 'Khá',
    description: 'Phong trào lâu năm, thể lực dồi dào, chiến thuật đôi rõ ràng',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  [BadmintonSkillLevel.KHA_PLUS]: {
    label: 'Khá+ (Bán chuyên)',
    description: 'Từng tập năng khiếu hoặc đánh giải phong trào có thành tích',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export enum MatchStatus {
  OPEN = 'OPEN',           // Đang tuyển người
  FULL = 'FULL',           // Đã đủ slot
  COMPLETED = 'COMPLETED', // Đã hoàn thành
  CANCELLED = 'CANCELLED', // Đã hủy
}

export interface MatchPlayer {
  userId: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  skillLevel?: BadmintonSkillLevel | SkillLevel;
  joinedAt: Date | string;
}

export interface Match {
  id: string;
  _id?: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  hostPhone?: string;
  sport: SportType;
  title: string;
  venueId?: string;
  venueName: string;
  venueAddress: string;
  district: string;
  city: string;
  courtNumber?: string; // e.g. "Sân 3"
  startTime: string; // ISO string
  endTime: string;   // ISO string
  totalSlots: number; // e.g. 4 hoặc 6
  joinedCount: number;
  players: MatchPlayer[];
  minSkillLevel: BadmintonSkillLevel;
  maxSkillLevel: BadmintonSkillLevel;
  estimatedCostText: string; // e.g. "Chia đều tiền sân tại chỗ ~35k-45k/người"
  notes?: string;
  shuttleType?: string; // e.g. "Cầu Hải Yến đỏ", "Cầu Thành Công"
  status: MatchStatus;
  shareCode?: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface CreateMatchDto {
  sport: SportType;
  title: string;
  venueId?: string;
  venueName: string;
  venueAddress: string;
  district: string;
  city?: string;
  courtNumber?: string;
  startTime: string;
  endTime: string;
  totalSlots: number;
  minSkillLevel: BadmintonSkillLevel;
  maxSkillLevel: BadmintonSkillLevel;
  estimatedCostText?: string;
  notes?: string;
  shuttleType?: string;
}

export interface MatchFilterDto {
  sport?: SportType;
  district?: string;
  city?: string;
  skillLevel?: BadmintonSkillLevel;
  status?: MatchStatus;
  date?: string; // YYYY-MM-DD
  keyword?: string;
}


