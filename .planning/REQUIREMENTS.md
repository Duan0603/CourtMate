# Requirements: CourtMate (Tournament & Registration Platform)

**Defined:** 2026-06-22
**Core Value:** Giúp Ban tổ chức phong trào dễ dàng tạo giải đấu, và giúp Vận động viên tìm kiếm, đăng ký giải đấu tại địa phương một cách tập trung, nhanh chóng.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication, Profiles & Roles

- [ ] **AUTH-01**: User can log in/out of the application.
- [ ] **AUTH-02**: Onboarding allows users to set their role (**Player** or **Organizer**) and primary city.

### Tournament Discovery

- [ ] **TOUR-01**: User can view a list of local tournaments showing sport, date, venue, organizer, fee, and registration status.
- [ ] **TOUR-02**: Detailed view showing tournament schedule, brackets, rules, and rules files.

### Tournament Creation (Organizer Workflow)

- [ ] **TOUR-03**: Tournament Organizers can create sports tournaments specifying rules, categories (doubles/singles), price, slot limits, and location.

### Player Registration Form (Player Workflow)

- [ ] **REG-01**: Players can register for active tournaments, supplying participant/team info (e.g. doubles partner name, contact, skill rating).
- [ ] **REG-02**: Registered users can view status of their registrations (Pending, Approved, Paid, Rejected) and registration history.

### Registration Management (Organizer Dashboard)

- [ ] **REG-03**: Organizers can view, filter, approve, reject, or export registration sheets for their tournaments.

### Smart Search & Filter

- [ ] **FILT-01**: User can search tournaments by title or organizer.
- [ ] **FILT-02**: User can filter tournament listings concurrently by Sport Type, Region, Time, and Registration Fee.

### Bookmarks

- [ ] **BOOK-01**: User can bookmark tournaments to save them.
- [ ] **BOOK-02**: Dedicated screen showing saved bookmarked tournaments.

### Quality Control & Moderation

- [ ] **VERI-01**: Trusted sports clubs and tournament organizers display a distinct "Verified Source" badge.
- [ ] **REPT-01**: User can report fake, incorrect, or duplicate tournament posts.
- [ ] **REPT-02**: System automatically hides tournament posts exceeding a threshold of reports.

### Multi-Region & Scaling

- [ ] **ROUT-01**: Geolocation routing automatically displays tournaments relevant to the user's current city.
- [ ] **ADMN-01**: Decoupled regional admin dashboard allowing city-level moderators to manage posts and process reports.
- [ ] **ADMN-02**: Scale infrastructure to handle peak registration traffic without system failures.

---

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### On-Demand Matchmaking
- **MATCH-01**: Local aggregated feed of public postings looking for players/opponents.
- **MATCH-02**: Instant hosting and joining system for custom matches ("Grab for Sports").

### AI Integrations
- **AI-01**: AI-based automatic content categorization and rules extraction.

---

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real-time Messaging | Direct messaging in-app. Deferring to keep focus on tournament hubs first. |
| In-app Payment Gateway | Processing registration fees directly via real-money transactions. Registration uses a mock payment status flow for MVP. |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| TOUR-01 | Phase 2 | Pending |
| TOUR-02 | Phase 2 | Pending |
| TOUR-03 | Phase 3 | Pending |
| REG-01 | Phase 4 | Pending |
| REG-02 | Phase 4 | Pending |
| REG-03 | Phase 5 | Pending |
| BOOK-01 | Phase 5 | Pending |
| BOOK-02 | Phase 5 | Pending |
| FILT-01 | Phase 6 | Pending |
| FILT-02 | Phase 6 | Pending |
| VERI-01 | Phase 7 | Pending |
| REPT-01 | Phase 7 | Pending |
| REPT-02 | Phase 7 | Pending |
| ROUT-01 | Phase 8 | Pending |
| ADMN-01 | Phase 8 | Pending |
| ADMN-02 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-22*
*Last updated: 2026-06-23 after scoping pivot*
