# Phase 1: foundation-local-fit-da-nang-mvp - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-24
**Phase:** 01-foundation-local-fit-da-nang-mvp
**Areas discussed:** Role modeling, Auth strategy, Onboarding flow, Location selection

---

## Role modeling

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Store as a profile field (e.g. 'type' or 'role' inside UserPreferences) and keep UserRole.USER for system-level access. | |
| Option 2 | Extend UserRole enum in @courtmate/shared directly with PLAYER and ORGANIZER roles. This makes roles mutually exclusive at the core account level. | ✓ |
| Option 3 | You decide: Choose the best structural layout for the roles. | |

**User's choice:** Extend UserRole enum in @courtmate/shared directly with PLAYER and ORGANIZER roles. This makes roles mutually exclusive at the core account level.
**Notes:** -

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Allow switching roles dynamically in settings (e.g. USER can toggle between PLAYER and ORGANIZER). | |
| Option 2 | Lock the role permanently at onboarding. If a user wants a different role, they must create a new account. This guarantees strict data partition (e.g. Player data vs Organizer data). | ✓ |
| Option 3 | You decide: Choose the most appropriate approach for role mutability. | |

**User's choice:** Lock the role permanently at onboarding. If a user wants a different role, they must create a new account. This guarantees strict data partition (e.g. Player data vs Organizer data).
**Notes:** -

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | System admins are strictly administrative. REGIONAL_ADMIN and SUPER_ADMIN roles do not participate as players or organizers in the normal app flows. | |
| Option 2 | Admins inherit/extend player/organizer capabilities, allowing them to also register for or create tournaments under the same admin account. | ✓ |
| Option 3 | You decide: Define administration permissions relative to PLAYER/ORGANIZER. | |

**User's choice:** Admins inherit/extend player/organizer capabilities, allowing them to also register for or create tournaments under the same admin account.
**Notes:** -

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Both require Full Name, Email, Location. PLAYER also requires sports interests/skills; ORGANIZER also requires Club/Organization name. | ✓ |
| Option 2 | Keep it minimal: only require Full Name, Email, and Location at onboarding. All other details (sports interests, club name) are optional settings. | |
| Option 3 | You decide: Let the agent decide which fields are required. | |

**User's choice:** Both require Full Name, Email, Location. PLAYER also requires sports interests/skills; ORGANIZER also requires Club/Organization name.
**Notes:** -

---

## Auth strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Implement a real backend authentication flow: JWT token-based auth with user schema, hashed password storage in MongoDB, and route guards. | ✓ |
| Option 2 | Build a mock backend auth flow: return mock JWTs and mock user data from NestJS controllers without persistent storage or actual cryptography. | |
| Option 3 | You decide: Choose the authentication implementation style. | |

**User's choice:** Implement a real backend authentication flow: JWT token-based auth with user schema, hashed password storage in MongoDB, and route guards.
**Notes:** -

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Standard email + password flow. Use bcrypt to hash passwords on the backend and authenticate users using username/password combinations. | |
| Option 2 | Passwordless/Magic Link auth. Send code/token via email. Highly secure but adds SMTP setup dependencies. | ✓ |
| Option 3 | You decide: Select the credentials method. | |

**User's choice:** Passwordless/Magic Link auth. Send code/token via email. Highly secure but adds SMTP setup dependencies.
**Notes:** -

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Support a development mode that logs the OTP to the backend console (for easy testing without SMTP), but configure Nodemailer/SMTP for production delivery. | ✓ |
| Option 2 | Strictly use a real SMTP service (e.g., Resend, Gmail SMTP) even in development. No console log shortcuts. | |
| Option 3 | You decide: Determine OTP delivery strategy. | |

**User's choice:** Support a development mode that logs the OTP to the backend console (for easy testing without SMTP), but configure Nodemailer/SMTP for production delivery.
**Notes:** -

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Store the JWT securely in expo-secure-store. This is standard secure practice on mobile. | ✓ |
| Option 2 | Store the JWT in @react-native-async-storage/async-storage. Not encrypted, but simple and fast to inspect/debug. | |
| Option 3 | You decide: Choose the storage library. | |

**User's choice:** Store the JWT securely in expo-secure-store. This is standard secure practice on mobile.
**Notes:** -

---

## Onboarding flow

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Mandate a multi-step onboarding wizard immediately after sign-up (Role Selection -> Personal Details -> Role-specific details like sports/club name). Users cannot skip this to access the app. | ✓ |
| Option 2 | Allow users to skip onboarding. Let them land on the home screen directly, displaying a permanent banner prompting them to select a role and location to unlock full app capabilities. | |
| Option 3 | You decide: Select the onboarding screens sequence. | |

**User's choice:** Mandate a multi-step onboarding wizard immediately after sign-up (Role Selection -> Personal Details -> Role-specific details like sports/club name). Users cannot skip this to access the app.
**Notes:** -

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Persist the onboarding completion status flag. If the user logs in but has not finished onboarding, automatically redirect and lock them in the onboarding wizard. | ✓ |
| Option 2 | Allow them to land on the main screens, but display prompts/modals and disable tournament actions (like registration or creation) until they complete onboarding in settings. | |
| Option 3 | You decide: Define the incomplete onboarding state handling. | |

**User's choice:** Persist the onboarding completion status flag. If the user logs in but has not finished onboarding, automatically redirect and lock them in the onboarding wizard.
**Notes:** -

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | A multi-select grid/list displaying supported sports (Badminton, Football, Pickleball, Tennis) with icons. Allows choosing multiple sports. | ✓ |
| Option 2 | A single-select list where they choose only their primary/favorite sport to keep the onboarding process extremely brief. | |
| Option 3 | You decide: Select the sport selection method. | |

**User's choice:** A multi-select grid/list displaying supported sports (Badminton, Football, Pickleball, Tennis) with icons. Allows choosing multiple sports.
**Notes:** -

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Provide simple categorical ratings (Beginner, Intermediate, Advanced) for each selected sport to keep it user-friendly. | ✓ |
| Option 2 | Provide numerical skill rating ranges (e.g. 1.0 to 5.0) or custom skill metrics. | |
| Option 3 | You decide: Define the skill level option structure. | |

**User's choice:** Provide simple categorical ratings (Beginner, Intermediate, Advanced) for each selected sport to keep it user-friendly.
**Notes:** -

---

## Location selection

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Predefined list of pilot cities (Da Nang, Ha Noi, Ho Chi Minh) via a dropdown/picker. This prevents invalid input and keeps alignment with the ROADMAP city structure. | ✓ |
| Option 2 | Free-form text input allowing users to type any city name, optionally with simple string lookup validation. | |
| Option 3 | You decide: Define the primary city selection method. | |

**User's choice:** Predefined list of pilot cities (Da Nang, Ha Noi, Ho Chi Minh) via a dropdown/picker. This prevents invalid input and keeps alignment with the ROADMAP city structure.
**Notes:** -

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Rely on manual user selection only. Do not request device GPS permission during onboarding in this phase. | |
| Option 2 | Request device GPS location permission during onboarding. If granted, auto-detect the user's city and pre-select it in the picker, but allow manual override. | ✓ |
| Option 3 | You decide: Determine GPS permission usage. | |

**User's choice:** Request device GPS location permission during onboarding. If granted, auto-detect the user's city and pre-select it in the picker, but allow manual override.
**Notes:** -

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Inform the user that CourtMate is currently only piloting in Da Nang, Ha Noi, and Ho Chi Minh, and prompt them to select one of these pilot cities to proceed. | ✓ |
| Option 2 | Block access or set a placeholder status for non-pilot locations, preventing them from accessing the dashboard until their city is supported. | |
| Option 3 | You decide: Define non-pilot city behavior. | |

**User's choice:** Inform the user that CourtMate is currently only piloting in Da Nang, Ha Noi, and Ho Chi Minh, and prompt them to select one of these pilot cities to proceed.
**Notes:** -

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Allow users to change their primary city in their profile settings at any time. This updates their feed/tournament discovery region. | ✓ |
| Option 2 | Lock the primary city to the account after onboarding. Changing it requires submitting an admin support request or account re-creation. | |
| Option 3 | You decide: Select location mutability approach. | |

**User's choice:** Allow users to change their primary city in their profile settings at any time. This updates their feed/tournament discovery region.
**Notes:** -

---

## the agent's Discretion

None — all areas of discretion were explicitly configured by user selections.

## Deferred Ideas

None — discussion remained focused on the defined scope of Phase 1.
