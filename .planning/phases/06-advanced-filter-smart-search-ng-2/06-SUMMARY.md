# Phase 06: Advanced Filter & Smart Search (Đông - 2) - Summary

## Accomplishments
- Implemented backend query logic for `TournamentFilterDto` in `tournaments.service.ts` allowing searches by keyword (title and organizer name), sport type, city, status, and registration fee ranges.
- Refactored `tournaments.controller.ts` and `tournaments.api.ts` to pass and serialize the advanced filter object.
- Created `TournamentFilterDto` in `@courtmate/shared`.
- Implemented frontend UI in `TournamentHubScreen.tsx` with a debounced search bar and a `FilterBottomSheet` using Tamagui components.

## User-facing changes
- Users can now type into the search bar to find tournaments and organizers dynamically (with a 300ms debounce).
- Users can click the "Bộ lọc" (Filter) button to open a bottom sheet and select region (city) and tournament status.
- Added quick sport filters below the search bar.
- Empty states and fallback views for regions with no tournaments handle filter combinations cleanly with a reset option.
