# Phase 05: Registration Management & Bookmarks (Duẫn - 2) - Plan

## Overview
This phase introduces bookmarking for players to save tournaments, and an organizer dashboard to review and approve registrations.

## Scope
1. **Bookmarks API**: Endpoints to add, remove, and fetch bookmarked tournaments.
2. **Bookmarks UI**: Update `TournamentCard` with a bookmark toggle, and create `BookmarksScreen` to display saved tournaments.
3. **Organizer Dashboard API**: Endpoints to fetch tournaments organized by the current user, and registrations for a specific tournament.
4. **Organizer Dashboard UI**: Create `OrganizerDashboardScreen` to list owned tournaments and manage (Approve/Reject) registrations.

## Architecture & Implementation Steps

### 1. Database & Schema
- Update `User` schema (`user.schema.ts`) to include `bookmarkedTournaments: string[]`.
- Update `User` shared interface (`packages/shared/src/index.ts`) to include `bookmarkedTournaments?: string[]`.

### 2. Backend Services & Controllers
- **UsersModule**: 
  - `users.service.ts`: Add `addBookmark(email, tournamentId)` and `removeBookmark(email, tournamentId)`.
  - `users.controller.ts`: Expose `PUT /users/bookmarks/:id` and `DELETE /users/bookmarks/:id`.
- **TournamentsModule**:
  - `tournaments.service.ts`: Add `findByOrganizerId(organizerId)` and `findByIds(ids[])`.
  - `tournaments.controller.ts`: Expose `GET /tournaments/my-organized` and `GET /tournaments/bookmarked?ids=...`.

### 3. Frontend API Services
- **Auth/User API** (`auth.api.ts`): Add `addBookmark` and `removeBookmark`.
- **Tournaments API** (`tournaments.api.ts`): Add `getBookmarkedTournaments` and `getMyOrganizedTournaments`.
- **Registrations API** (`registrations.api.ts`): Add `getRegistrationsByTournament`.

### 4. Frontend Components & Screens
- **`TournamentCard.tsx`**: Add `isBookmarked` and `onToggleBookmark` props. Render a bookmark icon button (Lucide icon).
- **`BookmarksScreen.tsx`**: Fetch user's `bookmarkedTournaments` from profile, then fetch full details. Render as a list of `TournamentCard`s.
- **`OrganizerDashboardScreen.tsx`**: 
  - Horizontal scroll view for owned tournaments.
  - Vertical list for registrations of the selected tournament.
  - Actions to Approve or Reject a registration.

## Verification
- Run backend and shared package builds (`npm run build`).
- Type check frontend (`npx tsc --noEmit`).
- Verify the bookmark icon state toggles properly.
- Verify organizer can update registration states to APPROVED or REJECTED.
