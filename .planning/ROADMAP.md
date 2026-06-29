# Roadmap: CourtMate (Tournament & Registration Platform)

## Overview

CourtMate's roadmap spans a 3-month cycle focusing on establishing a localized tournament aggregation and registration platform in Da Nang, and finally scaling hyper-local routing and delegation tools to expand nationally (starting with Hanoi and Ho Chi Minh City).

The roadmap is divided into exactly **8 phases** to match the team's 4-person structure (allocating exactly **2 phases per developer**).

---

## Phases Overview

- [x] **Phase 1: Authentication & Profiles (Duẫn - 1)** - Setup auth, profiles, and roles (Player vs Organizer). (completed 2026-06-24)
- [ ] **Phase 2: Tournament Hub - Discovery (Đông - 1)** - Browse list and detailed pages of local tournaments.
- [ ] **Phase 3: Tournament Creation Workflow (Phúc - 1)** - Form and API for organizers to create sports tournaments.
- [ ] **Phase 4: Player Registration Forms (Thịnh - 1)** - Player tournament registration forms (singles/doubles partner info, skill rating) and tracking.
- [ ] **Phase 5: Registration Management & Bookmarks (Duẫn - 2)** - Organizer panel to approve/reject registrations, and player bookmarks.
- [ ] **Phase 6: Advanced Filter & Smart Search (Đông - 2)** - Smart text search indexing and multi-criteria filter sheets.
- [ ] **Phase 7: Community Trust & Reports (Phúc - 2)** - Verification badges for official clubs/organizers and tournament report system.
- [ ] **Phase 8: Multi-Region Scaling & Administration (Thịnh - 2)** - Geolocation routing, performance scaling, and regional admin dashboards.

---

## Phase Details

### Phase 1: Authentication & Profiles (Duẫn - 1)

**Goal**: Initialize user registration, login, profile setup, and roles (Player vs Organizer).
**Depends on**: Nothing
**Requirements**: AUTH-01, AUTH-02
**Success Criteria**:

1. User can sign up and log in using email.
2. User can specify role (Player or Organizer) and home location.

**Plans**:
**Wave 1**

- [x] 01-01: Build backend User schemas, Mongoose connection, and NestJS controllers.

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02: Create frontend sign up, login, and profile role onboarding screens.

---

### Phase 2: Tournament Hub - Discovery (Đông - 1)

**Goal**: Display upcoming tournaments and detailed event rules/timelines.
**Depends on**: Phase 1
**Requirements**: TOUR-01, TOUR-02
**Success Criteria**:

1. Users can view a list of local tournaments matching their interest.
2. Users can view comprehensive tournament details (timelines, rules, slots).

**Plans**:

- [ ] 02-01: Build database schema and API endpoints for fetching and listing tournaments.
- [ ] 02-02: Implement responsive tournament list and detail screens.

---

### Phase 3: Tournament Creation Workflow (Phúc - 1)

**Goal**: Provide organizers with an easy-to-use form to create sports tournaments.
**Depends on**: Phase 2
**Requirements**: TOUR-03
**Success Criteria**:

1. Organizers can fill out a form (sport, location, dates, fee, categories) to create a tournament.
2. The created tournament is published and immediate available on the hub.

**Plans**:

- [ ] 03-01: Develop backend endpoints and validations for tournament creation.
- [ ] 03-02: Design the tournament creator form screens and interactive rules uploads.

---

### Phase 4: Player Registration Forms (Thịnh - 1)

**Goal**: Enable player registration for tournaments with team details and status tracking.
**Depends on**: Phase 3
**Requirements**: REG-01, REG-02
**Success Criteria**:

1. Players can register for active tournaments, specifying partner names for doubles and skill levels.
2. Players can track the status (Pending, Approved, Paid) of their tournament registrations.

**Plans**:

- [ ] 04-01: Design registration schema and API endpoints to submit registrations and query player status.
- [ ] 04-02: Build the registration form screen and registration tracker dashboard.

---

### Phase 5: Registration Management & Bookmarks (Duẫn - 2)

**Goal**: Support organizer approval workflow and player bookmarks.
**Depends on**: Phase 4
**Requirements**: REG-03, BOOK-01, BOOK-02
**Success Criteria**:

1. Organizers can view, approve, and reject registrations for their tournaments.
2. Users can bookmark tournaments to a saved list.

**Plans**:

- [ ] 05-01: Build endpoints for organizers to moderate registrations and players to bookmark tournaments.
- [ ] 05-02: Create the Organizer registrations management dashboard and Bookmarked tab.

---

### Phase 6: Advanced Filter & Smart Search (Đông - 2)

**Goal**: Implement advanced text search and filter metrics for tournaments.
**Depends on**: Phase 5
**Requirements**: FILT-01, FILT-02
**Success Criteria**:

1. User can search tournaments by keywords.
2. User can filter tournaments by sport type, region, fee range, and registration dates.

**Plans**:

- [ ] 06-01: Build text search indexes in MongoDB and handle advanced query filtering.
- [ ] 06-02: Implement search bar UI and interactive multi-select filtering sheet.

---

### Phase 7: Community Trust & Reports (Phúc - 2)

**Goal**: Implement source verification badges and a tournament reporting system to ensure high-quality content.
**Depends on**: Phase 6
**Requirements**: VERI-01, REPT-01, REPT-02
**Success Criteria**:

1. Trusted organizers and verified venues display a "Verified Source" badge.
2. Reported items exceeding a threshold are automatically hidden.

**Plans**:

- [ ] 07-01: Build community reports API and automatic content filtering logic on backend.
- [ ] 07-02: Integrate reporting actions, validation feedback, and verification badges in frontend.

---

### Phase 8: Multi-Region Scaling & Administration (Thịnh - 2)

**Goal**: Enable multi-city support and decentralized moderation for regional administrators.
**Depends on**: Phase 7
**Requirements**: ROUT-01, ADMN-01, ADMN-02
**Success Criteria**:

1. The app automatically recognizes the user's city and routes local tournaments accordingly.
2. Regional admins can access a dedicated dashboard to moderate reports and posts in their city.

**Plans**:

- [ ] 08-01: Build geolocation routing APIs and regional moderator authorization rules.
- [ ] 08-02: Build the regional moderator admin panel UI and optimize query latency.

---

## Progress

| Phase | Developer | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Authentication & Profiles | Duẫn | 2/2 | Complete    | 2026-06-24 |
| 2. Tournament Hub - Discovery | Đông | 0/2 | Not started | - |
| 3. Tournament Creation Workflow | Phúc | 0/2 | Not started | - |
| 4. Player Registration Forms | Thịnh | 0/2 | Not started | - |
| 5. Registration Management & Bookmarks | Duẫn | 0/2 | Not started | - |
| 6. Advanced Filter & Smart Search | Đông | 0/2 | Not started | - |
| 7. Community Trust & Reports | Phúc | 0/2 | Not started | - |
| 8. Multi-Region Scaling & Admin | Thịnh | 0/2 | Not started | - |
