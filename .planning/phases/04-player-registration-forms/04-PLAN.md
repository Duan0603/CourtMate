# Phase 4: Player Registration Forms - Plan

Implement the registration flow for players to sign up for active tournaments (specifying partner details and skill rating) and track their registration statuses and history.

## Goal

Enable player registration for tournaments with team details and status tracking.

## success_criteria

1. Players can register for active tournaments, specifying partner names for doubles and skill levels.
2. Players can track the status (Pending, Approved, Paid) of their tournament registrations.

## Proposed Changes

### Shared Module

*   **[index.ts](file:///d:/Project/CourtMate/CourtMate/packages/shared/src/index.ts)**:
    *   Defined `SkillLevel` and `RegistrationStatus` enums.
    *   Created `Registration` interface matching the MongoDB schema.
    *   Defined `CreateRegistrationDto` interface.
    *   Updated `Tournament` to support `registrationFee` and `slotsLimit`.

### Backend Component (`apps/backend`)

*   **[registration.entity.ts](file:///d:/Project/CourtMate/CourtMate/apps/backend/src/modules/registrations/infrastructure/persistence/registration.entity.ts)**: Mongoose schema and compound indices for registrations.
*   **[tournament-stub.entity.ts](file:///d:/Project/CourtMate/CourtMate/apps/backend/src/modules/registrations/infrastructure/persistence/tournament-stub.entity.ts)**: Stub schema mapping to tournaments collection.
*   **[create-registration.dto.ts](file:///d:/Project/CourtMate/CourtMate/apps/backend/src/modules/registrations/dtos/create-registration.dto.ts)**: Phone validations and inputs checking.
*   **[update-registration-status.dto.ts](file:///d:/Project/CourtMate/CourtMate/apps/backend/src/modules/registrations/dtos/update-registration-status.dto.ts)**: Status enum checks.
*   **[registrations.service.ts](file:///d:/Project/CourtMate/CourtMate/apps/backend/src/modules/registrations/domains/services/registrations.service.ts)**: DB queries for player registration counts and status modifiers.
*   **[register-player.use-case.ts](file:///d:/Project/CourtMate/CourtMate/apps/backend/src/modules/registrations/domains/use-cases/register-player.use-case.ts)**: Duplicate controls and slots limitations business rules.
*   **[registrations.controller.ts](file:///d:/Project/CourtMate/CourtMate/apps/backend/src/modules/registrations/controllers/http/registrations.controller.ts)**: Exposed REST routes.
*   **[app.module.ts](file:///d:/Project/CourtMate/CourtMate/apps/backend/src/app.module.ts)**: Mounted registrations module in NestJS.

### Frontend Component (`apps/frontend`)

*   **[api-client.ts](file:///d:/Project/CourtMate/CourtMate/apps/frontend/src/services/api-client.ts)**: Custom fetch client wrapper.
*   **[registrations.api.ts](file:///d:/Project/CourtMate/CourtMate/apps/frontend/src/features/registrations/services/registrations.api.ts)**: Communication with backend via apiClient.
*   **[useRegistrations.ts](file:///d:/Project/CourtMate/CourtMate/apps/frontend/src/features/registrations/hooks/useRegistrations.ts)**: Logic for form and state handlers using Alert.alert.
*   **[index.tsx](file:///d:/Project/CourtMate/CourtMate/apps/frontend/app/index.tsx)**: Home view displaying active tournaments.
*   **[tournament/\[id\].tsx](file:///d:/Project/CourtMate/CourtMate/apps/frontend/app/tournament/%5Bid%5D.tsx)**: Details view with bottom CTA button.
*   **[register/\[tournamentId\].tsx](file:///d:/Project/CourtMate/CourtMate/apps/frontend/app/register/%5BtournamentId%5D.tsx)**: Render form page.
*   **[tracker.tsx](file:///d:/Project/CourtMate/CourtMate/apps/frontend/app/tracker.tsx)**: Render tracker screen.
*   **[RegistrationForm.tsx](file:///d:/Project/CourtMate/CourtMate/apps/frontend/src/features/registrations/components/RegistrationForm.tsx)**: Form fields and validations.
*   **[RegistrationStatusCard.tsx](file:///d:/Project/CourtMate/CourtMate/apps/frontend/src/features/registrations/components/RegistrationStatusCard.tsx)**: Status indicators and checkouts simulator.

---

## Verification Plan

### Automated Verification
*   Compile checks:
    ```bash
    npm run typecheck
    ```

### Manual Verification
1. Navigate from Home -> Tournament details -> Form.
2. Submit valid details, check redirection, verify PENDING status in Tracker.
3. Simulate payment, verify transition to PAID.
