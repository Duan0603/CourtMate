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

- [ ] **AUTH-01**: User can log in/out and select role (Player vs Organizer).
- [ ] **TOUR-01**: User can view detailed tournament information and registration schedules.
- [ ] **TOUR-02**: Tournament Organizers can create sports tournaments specifying rules, categories, fees, and location.
- [ ] **REG-01**: Players can register for a tournament (e.g. doubles partners details, skill level).
- [ ] **REG-02**: Organizers can view, approve/reject, and manage player registration records.
- [ ] **FILT-01**: User can search and filter tournaments by sport type, city, date, and price.
- [ ] **BOOK-01**: User can bookmark tournaments to a saved directory.
- [ ] **VERI-01**: Trusted organizers and official sports clubs are marked with a "Verified Source" badge.
- [ ] **REPT-01**: User can report fake, spam, or incorrect tournament postings.
- [ ] **ROUT-01**: Automatic location-based routing displaying tournaments matching the user's current city.
- [ ] **ADMN-01**: Regional administrator dashboard to moderate local tournaments and process reports.

### Out of Scope

- **On-Demand Matchmaking Feed**: Aggregating raw posts/Zalo listings seeking instant player finders is deferred to v2.
- **Real-time Chat Engine**: Direct communication between players and organizers is deferred.
- **Native Payment Gateways**: Processing tournament fees via real monetary systems is deferred; the MVP uses a mock status payment flow.

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
