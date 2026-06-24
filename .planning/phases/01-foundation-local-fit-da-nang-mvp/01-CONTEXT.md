# Phase 1: Authentication & Profiles - Context

**Gathered:** 2026-06-24
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers a secure passwordless email authentication system (registration, login, logout) and a mandatory onboarding profile configuration flow where users configure their permanent roles (Player vs Organizer) and their primary pilot city (Da Nang, Ha Noi, Ho Chi Minh), integrating with persistent MongoDB storage on the backend.
</domain>

<decisions>
## Implementation Decisions

### Role Modeling
- **D-01 (Role Mapping):** Extend the `UserRole` enum in `@courtmate/shared` directly with `PLAYER` and `ORGANIZER` roles. This makes roles mutually exclusive at the core account level.
- **D-02 (Role Mutability):** Lock the role permanently at onboarding. If a user wants a different role, they must create a new account. This guarantees strict data partition (e.g., Player data vs. Organizer data).
- **D-03 (Admin Interaction):** System admins (REGIONAL_ADMIN, SUPER_ADMIN) inherit/extend player/organizer capabilities, allowing them to also register for or create tournaments under the same admin account.
- **D-04 (Required Details):** Both roles require Full Name, Email, and Location at onboarding. Players must additionally specify sports interests and skill ratings. Organizers must additionally specify their Club/Organization name.

### Auth Strategy
- **D-05 (Auth Type):** Implement a real backend authentication flow with NestJS: JWT token-based auth with user schema, hashed password storage in MongoDB, and route guards.
- **D-06 (Login Method):** Passwordless/Magic Link auth. Send an OTP code or login token to the user's email.
- **D-07 (OTP Delivery):** Support a development mode that logs the OTP to the backend console (for easy testing without SMTP), but configure Nodemailer/SMTP for production delivery.
- **D-08 (Token Storage):** Store the JWT securely in `expo-secure-store` on the mobile client.

### Onboarding Flow
- **D-09 (Wizard Structure):** Mandate a multi-step onboarding wizard immediately after sign-up (Role Selection -> Personal Details -> Role-specific details). Users cannot skip this to access the app.
- **D-10 (Incomplete Onboarding):** Persist the onboarding completion status flag. If a user logs in but has not finished onboarding, automatically redirect and lock them in the onboarding wizard.
- **D-11 (Sports Picker):** Display a multi-select grid/list of supported sports (Badminton, Football, Pickleball, Tennis) with icons. Allows choosing multiple sports.
- **D-12 (Skill Level Picker):** Provide simple categorical ratings (Beginner, Intermediate, Advanced) for each selected sport.

### Location Selection
- **D-13 (City Picker):** Predefined list of pilot cities (Da Nang, Ha Noi, Ho Chi Minh) via a dropdown/picker to prevent invalid inputs.
- **D-14 (GPS Integration):** Request device GPS location permission during onboarding. If granted, auto-detect the user's city and pre-select it in the picker, but allow manual override.
- **D-15 (Non-Pilot Cities):** If GPS shows the user is outside the pilot cities, inform them that CourtMate is currently only piloting in Da Nang, Ha Noi, and Ho Chi Minh, and prompt them to select one of these pilot cities to proceed.
- **D-16 (Location Mutability):** Allow users to change their primary city in their profile settings at any time, which dynamically updates their tournament discovery region.

### Agent Discretion
No areas of discretion were deferred to the agent; all structural and behavioral options were explicitly resolved during user alignment.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/ROADMAP.md` § Phase 1 — Defines goals, requirements, and success criteria for Phase 1.
- `.planning/REQUIREMENTS.md` § Authentication, Profiles & Roles — Outlines requirements AUTH-01 and AUTH-02.

### Types & Schema
- `packages/shared/src/index.ts` — Defines the shared types, `UserRole` enum, and user schemas.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/frontend/src/features/auth/screens/LoginScreen.tsx` — Login screen UI shell utilizing Tamagui.
- `apps/frontend/src/features/auth/components/LoginForm.tsx` — Text input for credentials, to be modified for OTP submission.
- `apps/frontend/src/features/auth/hooks/useLogin.ts` — Auth state hook.
- `apps/frontend/src/features/auth/services/auth.api.ts` — API request client.
- `@courtmate/shared` (`packages/shared/src/index.ts`) — Common typescript interfaces and enums.

### Established Patterns
- React Native component layout with Tamagui (`YStack`, `H2`, `Paragraph`, etc.).
- NestJS modular backend pattern (e.g. `app.module.ts`, `modules/articles` folder structure).
- Mongoose-based database modeling and migrations framework (`apps/backend/migrations` and `apps/backend/src/core/database`).

### Integration Points
- `apps/frontend/src/App.tsx` / `apps/frontend/src/navigation/types.ts` — Where the new auth state provider and onboarding redirection lock should connect.
- `apps/backend/src/app.module.ts` — Registering the new authentication and user modules on the backend.
</code_context>

<specifics>
## Specific Ideas

- **Dev Loop Comfort:** The developer console logging of OTPs must print a clear, large terminal banner: `[DEV ONLY] OTP code for email@example.com is: 123456`.
- **Role and location restriction:** Front-end route guards must redirect any user missing `preferences.location` or containing an uninitialized `role` directly back to the onboarding wizard.
</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.
</deferred>

---

*Phase: 01-foundation-local-fit-da-nang-mvp*
*Context gathered: 2026-06-24*
