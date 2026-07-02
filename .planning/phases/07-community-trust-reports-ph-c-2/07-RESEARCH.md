# Phase 7: Community Trust & Reports - Research

## Context Review
The goal is to implement the reporting mechanism for users, automatic threshold-based flagging, and the Verified Source badge. Based on `07-CONTEXT.md`, the requirements are:
1. **Report Categories**: Pre-defined list of reasons (Fake, Spam, Duplicate) + "Other" text field.
2. **Auto-hide Threshold**: 5 unique user reports hide the tournament/feed item for admin review.
3. **Verified Badge**: Displayed for organizers with `isVerified: true`.

## Codebase Analysis
- **Shared Types (`packages/shared/src/index.ts`)**:
  - We already have `CreateReportDto` with `targetId`, `targetType`, `reason`, `notes`.
  - `User`, `FeedItem`, and `Tournament` already have `isVerified` in `author`/`organizer`. We need a UI component (e.g., a checkmark icon) to display this badge.
  - `Tournament` needs to be updated to include `reportsCount: number` and possibly `isHidden: boolean` to support the auto-hide feature. (Currently, `FeedItem` has `reportsCount`, but `Tournament` does not).
- **Backend (NestJS + Mongoose)**:
  - Create a `reports` module with a Mongoose schema to store individual reports. This tracks unique user reports (User ID + Target ID) to prevent duplicate reporting by the same user.
  - Update `tournaments.service.ts` and `feed.service.ts` to increment `reportsCount` when a report is created.
  - Add threshold logic: if `reportsCount >= 5`, set `isHidden = true` on the target entity.
  - Filter out `isHidden: true` items from public feed/tournament listing queries.
- **Frontend (React Native + Tamagui)**:
  - Add a Report button/icon on the Tournament Detail screen and Feed Item cards.
  - Create a Modal or Bottom Sheet for the Report Form containing Radio buttons for reasons and a Text Input for the "Other" notes.
  - Create a `VerifiedBadge` component (e.g., using Lucide Icons `BadgeCheck` or similar) and render it next to the organizer/author name if `isVerified` is true.
