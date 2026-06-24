# Phase 2: Tournament Hub - Discovery (Đông - 1) - Context

**Gathered:** 2026-06-24
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the Tournament Hub Discovery feed and detailed tournament views. It is the core content layer of the application, allowing users to browse local tournaments, filter them basically by sport type, and view comprehensive event rules and schedules (TOUR-01, TOUR-02).
</domain>

<decisions>
## Implementation Decisions

### Empty State Strategy
- **D-01 (Fallback Feed):** When a user's pilot city has no active tournaments, fallback to a national view displaying tournaments from other pilot cities.
- **D-02 (Fallback Feed UI):** Clearly distinguish out-of-city tournaments by adding an "Other Cities" section header and dimming the location badges. Ordered by nearest geographical pilot city, then by closest upcoming date. Supported by infinite scrolling/pagination.
- **D-03 (Fallback Feed Empty):** If there are NO active tournaments nationwide, show a simple "No tournaments available yet" message alongside the "Create tournament" CTA.
- **D-04 (Creation CTA):** Include a "Create the first tournament here" CTA in the empty state. Since tournament creation is in Phase 3, clicking it shows a "Coming Soon" toast.
- **D-05 (Visuals):** Include a subtle, premium sport-related illustration (e.g., an empty court icon).
- **D-06 (Refresh):** Support pull-to-refresh to re-fetch and re-evaluate if the city has tournaments.
- **D-07 (Notify Me):** Add a dummy "Notify me" button that shows a professional and clear toast: "We'll notify you when a tournament is created in your city."
- **D-08 (Change City):** Provide a "Change City" link that opens a simple bottom sheet picker directly on the screen. Selecting a new city permanently updates the user's profile location.

### Layout & Density
- **D-09 (Card Layout):** Tournaments are displayed as large image cards to maximize visual impact ("wow" factor).
- **D-10 (Card Data):** Primary information visible on the card: Tournament Name, Date, Sport Type, Location (District), and Fee. Multiple categories are summarized as "+X categories". Fee is displayed as "From [X] VND" if it varies.
- **D-11 (Cover Image):** If an organizer does not provide a cover image, use a high-quality default placeholder image specific to the sport type.
- **D-12 (Organizer Trust):** Include a small avatar and the organizer's name prominently at the bottom of the card.
- **D-13 (Registration Status):** Shown as a colored badge/pill (e.g., Green 'Open', Red 'Full', Gray 'Upcoming') layered on top of the image.
- **D-14 (Bookmarks Placeholder):** Include a placeholder/disabled Bookmark (heart) icon in the top right corner of the card to reserve UI space for Phase 5. Clicking it shows a "Coming in Phase 5" toast.

### Basic Feed Sorting
- **D-15 (Default Sorting):** Default chronological order by upcoming date (nearest events first). 
- **D-16 (Status Prioritization):** 'Open for Registration' tournaments are pushed to the top, while 'Full' or 'In Progress' events are pushed to the bottom.
- **D-17 (Sport Filtering):** Include a horizontal scroll list of sports (Badminton, Football, Pickleball, Tennis) at the top of the feed for basic filtering.
- **D-18 (Multiple Sports):** If a user selected multiple sports at onboarding, show an 'All My Sports' combined feed by default, relying on the horizontal tabs for filtering.

### Detail Page Structure
- **D-19 (Navigation):** Organized using Tabs (e.g., Info, Rules, Schedule, Participants) to keep information clean and focused.
- **D-20 (Action Bar):** Sticky bottom bar displaying the fee and the "Register" button across all tabs.
- **D-21 (Registration Flow):** Clicking "Register" in this phase shows a "Registration opening soon" toast (actual registration is deferred to Phase 4).
- **D-22 (Rules Display):** Detailed tournament rules are rendered inline inside the "Rules" tab. PDF links open in the system browser.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/ROADMAP.md` § Phase 2 — Defines goals, requirements, and success criteria for Phase 2.
- `.planning/REQUIREMENTS.md` § Tournament Discovery — Outlines requirements TOUR-01 and TOUR-02.
- `.planning/PROJECT.md` — Project context and core value.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `@courtmate/shared` (`packages/shared/src/index.ts`) — User schema and roles setup in Phase 1; use it to retrieve the user's primary location and sports preferences.

### Established Patterns
- UI layouts and routing established in Phase 1 (Tamagui, Expo Router).

</code_context>

<specifics>
## Specific Ideas

- Focus on a premium, mobile-first design leveraging Tamagui's layout primitives.

</specifics>

<deferred>
## Deferred Ideas

- Tournament Creation Flow (Phase 3)
- Player Registration Form (Phase 4)
- Bookmarks and advanced registration management (Phase 5)
- Advanced Text Search & Filtering (Phase 6)

</deferred>

---

*Phase: 02-tournament-hub-discovery-ng-1*
*Context gathered: 2026-06-24*
