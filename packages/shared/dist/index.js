"use strict";
// Shared types and constants for CourtMate
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationStatus = exports.SkillLevel = exports.REGION_CONFIGS = exports.SUPPORTED_CITIES = exports.ModerationAction = exports.ProfileType = exports.TournamentStatus = exports.UserRole = exports.ActivityType = exports.SportType = void 0;
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
