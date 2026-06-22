# CourtMate

## What This Is

CourtMate is a mobile-first sports information aggregation and personalization platform. It serves as a unified hub that automatically collects and customizes public sports activities (looking for players, recruiting members, tournament announcements) from scattered social media sources (Facebook, Zalo, websites) into a single hyper-local feed.

## Core Value

Giúp người chơi thể thao phong trào nhanh chóng nắm bắt và tìm kiếm thông tin thể thao, đối tác, giải đấu tại địa phương từ một Hub thông tin duy nhất.

## Business Context

- **Customer**: Sports enthusiasts, tournament organizers, and sports clubs.
- **Revenue model**: Sponsor advertisements, premium verified badges for organizers, and booking commissions.
- **Success metric**: User retention rate, daily active users (DAU), and volume of aggregated postings.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **AUTH-01**: User can log in/out and set sport preferences.
- [ ] **FEED-01**: User can view aggregated feed of local sports activities (finding players, recruitment, etc.).
- [ ] **TOUR-01**: User can view detailed tournament information and registration links.
- [ ] **FILT-01**: User can search and filter feed content by sport type, area, time, and activity type.
- [ ] **BOOK-01**: User can bookmark posts and tournaments.
- [ ] **NOTF-01**: User receives notifications when new content matching preferences is posted.
- [ ] **VERI-01**: Trusted sources (Clubs, Organizers) are marked with a Verified badge.
- [ ] **REPT-01**: User can report spam, expired, or incorrect posts.
- [ ] **ROUT-01**: Automatic location-based routing displaying content relevant to the user's city.
- [ ] **ADMN-01**: Region-based admin dashboard to manage regional content and moderate reports.

### Out of Scope

- **Real-time Chat Engine**: Direct communication between users is deferred to focus on information discovery and aggregation first.
- **Direct Venue Booking**: Native court reservation engine is out of scope for the MVP phase, focusing on tournament links and aggregator posts first.
- **Native AI Tagging/Summarization**: Auto-tagging and announcement text summarization are deferred to future scope.

## Context

- **Local Market**: Initial pilot launching in Da Nang to test local fit, before scaling to Hanoi and Ho Chi Minh City.
- **Data aggregation**: System aggregates public data from various social sources, demanding strong validation tools and community report mechanisms to maintain high content quality.

## Constraints

- **Tech Stack**: React Native / Expo for multi-platform iOS & Android.
- **Data Layer**: Mock Data approach for the initial frontend presentation layer to speed up UI/UX iterations.
- **Design Layout**: Mobile responsive with large CTA single-hand touch targets placed within comfortable reach of the user's thumb.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Greenfield Aggregator | Standardize scattered sports posts into a local aggregator instead of building another booking app. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-22 after initialization*
