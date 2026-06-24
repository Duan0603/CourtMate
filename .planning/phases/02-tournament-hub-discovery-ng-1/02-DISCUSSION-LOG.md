# Phase 2: Tournament Hub - Discovery (Đông - 1) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-24
**Phase:** 02-tournament-hub-discovery-ng-1
**Areas discussed:** Empty State Strategy, Layout & Density, Basic Feed Sorting, Detail Page Structure

---

## Empty State Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | (Recommended) Fallback to national view: Show a friendly message and display tournaments from other pilot cities. | ✓ |
| 2 | Strict local filter: Show an empty state graphic ("No tournaments here yet") and encourage them to change city or check back later. | |
| 3 | You decide: Pick whichever is easier to implement for MVP. | |

**User's choice:** 1
**Notes:** Decided to fallback to national view, display "Other Cities" section with dimmed location badges, ordered by nearest geographically. Added "Coming Soon" toast to creation CTA, dummy "Notify me" button, and inline city changer that updates persistent profile location.

---

## Layout & Density

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | (Recommended) Large image cards (focus on 'wow' factor and visuals). | ✓ |
| 2 | Compact list view (focus on scanning many tournaments quickly). | |
| 3 | Grid view (2 columns, good for balance). | |

**User's choice:** 1
**Notes:** Large image cards with primary info (Name, Date, Sport, Location, Fee). Registration status as a colored badge. Default placeholder image for missing covers. Included organizer avatar. Placeholder bookmark icon. Summarized categories.

---

## Basic Feed Sorting

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | (Recommended) Chronological by upcoming date (nearest events first). | ✓ |
| 2 | By recently added (newest posts first). | |
| 3 | You decide. | |

**User's choice:** 1
**Notes:** Chronological order, prioritizing "Open for Registration" tournaments. Includes horizontal scroll list of sports for basic filtering. "All My Sports" combined feed by default if multiple sports selected.

---

## Detail Page Structure

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | (Recommended) Tabs (e.g. Info, Rules, Schedule, Participants) to keep it clean. | ✓ |
| 2 | One long scrolling page with sticky section headers. | |
| 3 | You decide. | |

**User's choice:** 1
**Notes:** Tabs for clean organization. Sticky bottom bar with 'Register' CTA showing 'Registration opening soon'. Inline rules.

---

## the agent's Discretion

None — all questions explicitly resolved.

## Deferred Ideas

Tournament Creation, Registration, Bookmarks, and Advanced filtering mapped to appropriate subsequent phases.
