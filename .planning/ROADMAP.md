# Roadmap: CourtMate

## Overview

CourtMate's roadmap spans a 3-month cycle focusing on establishing localized market fit in Da Nang, optimizing content quality and user preferences, and finally scaling hyper-local routing and delegation tools to expand nationally (starting with Hanoi and Ho Chi Minh City).

## Phases

- [ ] **Phase 1: Foundation & Local Fit (Da Nang MVP)** - Establish the core feed, personalization settings, and tournament directory using seeded Da Nang data.
- [ ] **Phase 2: Optimization, Verification & Notifications** - Enhance the content filters, implement the source verification system, and add notification capabilities.
- [ ] **Phase 3: Scale-up & Regional Expansion** - Implement location-based routing, build decentralized admin tools, and optimize system load capability.

## Phase Details

### Phase 1: Foundation & Local Fit (Da Nang MVP)

**Goal**: Launch the MVP version dedicated to the Da Nang community, featuring aggregated feeds, tournament hub, personalization, and bookmarking.
**Depends on**: Nothing
**Requirements**: AUTH-01, AUTH-02, FEED-01, FEED-02, FEED-03, TOUR-01, TOUR-02, BOOK-01, BOOK-02
**Success Criteria**:

  1. User can choose sport interests and log in to view a feed of sports activities filtered according to their sports selection.
  2. User can view a detailed page for sports tournaments, including the registration link.
  3. User can bookmark posts/tournaments and retrieve them from a saved screen.
  4. The layout adapts properly on mobile devices with touch targets positioned in comfortable reach of the thumb.

**Plans**: 3 plans

Plans:

- [ ] 01-01: Set up core app shell with mock data provider and basic routing
- [ ] 01-02: Implement personalized aggregated Home Feed and single-hand touch navigation
- [ ] 01-03: Implement Tournament Hub and Bookmark storage feature

---

### Phase 2: Optimization, Verification & Notifications

**Goal**: Optimize the discovery workflow with smart filtering, introduce community reporting, flag trusted verified sources, and launch notification settings.
**Depends on**: Phase 1
**Requirements**: FILT-01, FILT-02, VERI-01, REPT-01, REPT-02
**Success Criteria**:

  1. User can search posts by text and apply multiple filters (sport, area, time, category) concurrently.
  2. Posts from recognized/partner accounts are highlighted with a "Verified Source" badge.
  3. User can report a post, and posts exceeding a threshold of reports are hidden.

**Plans**: 2 plans

Plans:

- [ ] 02-01: Implement multi-criteria search filters and source verification indicators
- [ ] 02-02: Integrate community report workflow and post notification reminders

### Phase 3: Scale-up & Regional Expansion

**Goal**: Transition from a single-city app to a nationwide multi-region platform by introducing city-based routing, decentralized moderation, and performance scaling.
**Depends on**: Phase 2
**Requirements**: ROUT-01, ADMN-01, ADMN-02
**Success Criteria**:

  1. The app automatically recognizes the user's city/location and loads local sports feeds and tournaments.
  2. Regional admins can access a dashboard to moderate posts and manage reports from their designated city.
  3. System processes search and feed rendering efficiently with minimal lag.

**Plans**: 2 plans

Plans:

- [ ] 03-01: Implement city-based routing and regional geolocation detection
- [ ] 03-02: Build decentralized regional admin panel and optimize database indexing for scaling

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Local Fit (Da Nang MVP) | 0/3 | Not started | - |
| 2. Optimization & Verification | 0/2 | Not started | - |
| 3. Scale-up & Regional Expansion | 0/2 | Not started | - |
