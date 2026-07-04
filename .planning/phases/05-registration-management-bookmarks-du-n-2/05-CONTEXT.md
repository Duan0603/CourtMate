# Phase 05: Registration Management & Bookmarks (Duẫn - 2)

## Domain
Registration workflow for organizers and bookmarking functionality for players.

## Canonical Refs
- `.planning/ROADMAP.md`

## Decisions Captured
- **Bookmark Storage**: Stored as an array (`bookmarkedTournaments: string[]`) on the User schema for MVP simplicity.
- **Organizer Dashboard UI**: Will be implemented as a completely separate main Tab in the bottom navigation.
- **Registration Status Flow**: "Approve" is the final tracked state for the MVP. We will not track "Paid" status at this time.
