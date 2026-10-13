"use strict";
// Shared types and constants for CourtMate
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchStatus = exports.BADMINTON_SKILL_LABELS = exports.BadmintonSkillLevel = exports.RegistrationStatus = exports.SkillLevel = exports.REGION_CONFIGS = exports.SUPPORTED_CITIES = exports.ModerationAction = exports.ProfileType = exports.TournamentStatus = exports.UserRole = exports.ActivityType = exports.SportType = void 0;
var SportType;
(function (SportType) {
    SportType["BADMINTON"] = "BADMINTON";
    SportType["FOOTBALL"] = "FOOTBALL";
    SportType["PICKLEBALL"] = "PICKLEBALL";
    SportType["TENNIS"] = "TENNIS";
})(SportType || (exports.SportType = SportType = {}));
var ActivityType;
(function (ActivityType) {
    ActivityType["MATCHMAKING"] = "MATCHMAKING";
    ActivityType["RECRUITMENT"] = "RECRUITMENT";
    ActivityType["GENERAL"] = "GENERAL";
})(ActivityType || (exports.ActivityType = ActivityType = {}));
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["PLAYER"] = "PLAYER";
    UserRole["ORGANIZER"] = "ORGANIZER";
    UserRole["REGIONAL_ADMIN"] = "REGIONAL_ADMIN";
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var TournamentStatus;
(function (TournamentStatus) {
    TournamentStatus["UPCOMING"] = "UPCOMING";
    TournamentStatus["OPEN"] = "OPEN";
    TournamentStatus["FULL"] = "FULL";
    TournamentStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TournamentStatus["COMPLETED"] = "COMPLETED";
})(TournamentStatus || (exports.TournamentStatus = TournamentStatus = {}));
// --- Phase 8: Multi-Region & Admin ---
var ProfileType;
(function (ProfileType) {
    ProfileType["PLAYER"] = "PLAYER";
    ProfileType["ORGANIZER"] = "ORGANIZER";
})(ProfileType || (exports.ProfileType = ProfileType = {}));
var ModerationAction;
(function (ModerationAction) {
    ModerationAction["HIDE"] = "HIDE";
    ModerationAction["UNHIDE"] = "UNHIDE";
    ModerationAction["FEATURE"] = "FEATURE";
    ModerationAction["UNFEATURE"] = "UNFEATURE";
    ModerationAction["VERIFY_ORGANIZER"] = "VERIFY_ORGANIZER";
    ModerationAction["REVOKE_VERIFICATION"] = "REVOKE_VERIFICATION";
})(ModerationAction || (exports.ModerationAction = ModerationAction = {}));
exports.SUPPORTED_CITIES = ['Da Nang', 'Ha Noi', 'Ho Chi Minh'];
exports.REGION_CONFIGS = [
    { city: 'Da Nang', displayName: 'Đà Nẵng', isActive: true },
    { city: 'Ha Noi', displayName: 'Hà Nội', isActive: true },
    { city: 'Ho Chi Minh', displayName: 'TP. Hồ Chí Minh', isActive: true },
];
var SkillLevel;
(function (SkillLevel) {
    SkillLevel["BEGINNER"] = "BEGINNER";
    SkillLevel["INTERMEDIATE"] = "INTERMEDIATE";
    SkillLevel["ADVANCED"] = "ADVANCED";
})(SkillLevel || (exports.SkillLevel = SkillLevel = {}));
var RegistrationStatus;
(function (RegistrationStatus) {
    RegistrationStatus["PENDING"] = "PENDING";
    RegistrationStatus["APPROVED"] = "APPROVED";
    RegistrationStatus["PAID"] = "PAID";
    RegistrationStatus["REJECTED"] = "REJECTED";
})(RegistrationStatus || (exports.RegistrationStatus = RegistrationStatus = {}));
// ─── MATCHMAKING & BADMINTON SKILL LEVELS ─────────────────────────────────────
var BadmintonSkillLevel;
(function (BadmintonSkillLevel) {
    BadmintonSkillLevel["YEU"] = "YEU";
    BadmintonSkillLevel["TBY"] = "TBY";
    BadmintonSkillLevel["TB"] = "TB";
    BadmintonSkillLevel["TB_PLUS"] = "TB_PLUS";
    BadmintonSkillLevel["KHA"] = "KHA";
    BadmintonSkillLevel["KHA_PLUS"] = "KHA_PLUS";
})(BadmintonSkillLevel || (exports.BadmintonSkillLevel = BadmintonSkillLevel = {}));
exports.BADMINTON_SKILL_LABELS = {
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
var MatchStatus;
(function (MatchStatus) {
    MatchStatus["OPEN"] = "OPEN";
    MatchStatus["FULL"] = "FULL";
    MatchStatus["COMPLETED"] = "COMPLETED";
    MatchStatus["CANCELLED"] = "CANCELLED";
})(MatchStatus || (exports.MatchStatus = MatchStatus = {}));
