export declare enum SportType {
    BADMINTON = "BADMINTON",
    FOOTBALL = "FOOTBALL",
    PICKLEBALL = "PICKLEBALL",
    TENNIS = "TENNIS"
}
export declare enum ActivityType {
    MATCHMAKING = "MATCHMAKING",
    RECRUITMENT = "RECRUITMENT",
    GENERAL = "GENERAL"
}
export declare enum UserRole {
    USER = "USER",
    PLAYER = "PLAYER",
    ORGANIZER = "ORGANIZER",
    REGIONAL_ADMIN = "REGIONAL_ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN"
}
export interface UserPreferences {
    sports: SportType[];
    location?: string;
    skillLevel?: string;
    clubName?: string;
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
    location: string;
    city: string;
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
export declare enum TournamentStatus {
    UPCOMING = "UPCOMING",
    OPEN = "OPEN",
    FULL = "FULL",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED"
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
    coverImage?: string;
    startDate: Date;
    endDate: Date;
    location: string;
    district?: string;
    city: string;
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
    schedule?: string[];
    matchDates?: Date[];
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
}
export interface CreateReportDto {
    targetId: string;
    targetType: 'FEED_ITEM' | 'TOURNAMENT';
    reason: string;
    notes?: string;
}
export declare enum ProfileType {
    PLAYER = "PLAYER",
    ORGANIZER = "ORGANIZER"
}
export declare enum ModerationAction {
    HIDE = "HIDE",
    UNHIDE = "UNHIDE",
    FEATURE = "FEATURE",
    UNFEATURE = "UNFEATURE",
    VERIFY_ORGANIZER = "VERIFY_ORGANIZER",
    REVOKE_VERIFICATION = "REVOKE_VERIFICATION"
}
export declare const SUPPORTED_CITIES: readonly ["Da Nang", "Ha Noi", "Ho Chi Minh"];
export type SupportedCity = (typeof SUPPORTED_CITIES)[number];
export interface RegionConfig {
    city: SupportedCity;
    displayName: string;
    isActive: boolean;
}
export declare const REGION_CONFIGS: RegionConfig[];
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
export declare enum SkillLevel {
    BEGINNER = "BEGINNER",
    INTERMEDIATE = "INTERMEDIATE",
    ADVANCED = "ADVANCED"
}
export declare enum RegistrationStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    PAID = "PAID",
    REJECTED = "REJECTED"
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
export declare enum BadmintonSkillLevel {
    YEU = "YEU",// Yếu / Mới chơi
    TBY = "TBY",// Trung bình yếu
    TB = "TB",// Trung bình
    TB_PLUS = "TB_PLUS",// Trung bình khá
    KHA = "KHA",// Khá
    KHA_PLUS = "KHA_PLUS"
}
export declare const BADMINTON_SKILL_LABELS: Record<BadmintonSkillLevel, {
    label: string;
    description: string;
    color: string;
}>;
export declare enum MatchStatus {
    OPEN = "OPEN",// Đang tuyển người
    FULL = "FULL",// Đã đủ slot
    COMPLETED = "COMPLETED",// Đã hoàn thành
    CANCELLED = "CANCELLED"
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
    courtNumber?: string;
    startTime: string;
    endTime: string;
    totalSlots: number;
    joinedCount: number;
    players: MatchPlayer[];
    minSkillLevel: BadmintonSkillLevel;
    maxSkillLevel: BadmintonSkillLevel;
    estimatedCostText: string;
    notes?: string;
    shuttleType?: string;
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
    date?: string;
    keyword?: string;
}
