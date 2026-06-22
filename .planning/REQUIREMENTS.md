# Requirements: CourtMate

**Defined:** 2026-06-22
**Core Value:** Giúp người chơi thể thao phong trào nhanh chóng nắm bắt và tìm kiếm thông tin thể thao, đối tác, giải đấu tại địa phương từ một Hub thông tin duy nhất.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication & Preferences

- [ ] **AUTH-01**: User can log in/out of the application.
- [ ] **AUTH-02**: User can select sports of interest (e.g. Badminton, Football, Pickleball, Tennis) to personalize their experience.

### Aggregated Feed

- [ ] **FEED-01**: User can view a feed of sports activities gathered from public communities (looking for players, team recruitment, matches).
- [ ] **FEED-02**: Home feed prioritizes items based on the user's selected sports interests.
- [ ] **FEED-03**: Interactive CTA button placed for single-hand touch target ease of use.

### Tournament Hub

- [ ] **TOUR-01**: User can browse list of upcoming local tournaments with key info: Title, Time, Location, Organizer, Rules, and Registration link.
- [ ] **TOUR-02**: Detailed view showing comprehensive tournament information.

### Smart Search & Filter

- [ ] **FILT-01**: User can search activities by keyword.
- [ ] **FILT-02**: User can filter search results by Sport Type, Region, Time, and Activity Type.

### Bookmark & Interactions

- [ ] **BOOK-01**: User can bookmark posts or tournaments to view them later.
- [ ] **BOOK-02**: Dedicated screen showing saved bookmarks.

### Quality Control & Moderation

- [ ] **VERI-01**: Trusted and verified profiles (Clubs, Organizers) display a distinct "Verified Source" badge next to their names.
- [ ] **REPT-01**: User can report post (spam, incorrect info, expired content).
- [ ] **REPT-02**: System changes visibility of reported posts if threshold reports are met.

### Scaling & Hyper-Local Routing

- [ ] **ROUT-01**: Application auto-detects user city/location and prioritizes hyper-local content for that city.
- [ ] **ADMN-01**: Decoupled Admin Dashboard allowing regional admins to manage posts, approve verified status, and process reports for their respective cities.
- [ ] **ADMN-02**: Scale infrastructure to handle concurrent user traffic peaks without app crashes.

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### AI Integration

- **AI-01**: AI-based automatic content categorization and tagging.
- **AI-02**: AI summary for lengthy tournament rules and announcements.

### Direct Booking & Partnerships

- **BOOK-03**: Direct booking integration with local sport facilities.
- **PART-01**: Automated API integrations with Facebook / Zalo groups for instant aggregation syncing.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real-time Messaging | Users direct message each other in-app. Deferring to keep development focused on information hubs. |
| In-app Payment Gateway | Paying tournament fees directly through CourtMate. Registration links will point to external organizer links. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| FEED-01 | Phase 1 | Pending |
| FEED-02 | Phase 1 | Pending |
| FEED-03 | Phase 1 | Pending |
| TOUR-01 | Phase 1 | Pending |
| TOUR-02 | Phase 1 | Pending |
| BOOK-01 | Phase 1 | Pending |
| BOOK-02 | Phase 1 | Pending |
| FILT-01 | Phase 2 | Pending |
| FILT-02 | Phase 2 | Pending |
| VERI-01 | Phase 2 | Pending |
| REPT-01 | Phase 2 | Pending |
| REPT-02 | Phase 2 | Pending |
| ROUT-01 | Phase 3 | Pending |
| ADMN-01 | Phase 3 | Pending |
| ADMN-02 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-22*
*Last updated: 2026-06-22 after initial definition*
