# Feature Research

**Domain:** React Native & Expo Mobile UI/UX Prototyping
**Researched:** 2026-06-18
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| GPS Home Dashboard | Displays location and sports search | LOW | Essential for setting current location. |
| Full-screen Map Search | Visualizes courts and matches nearby | MEDIUM | Integrates react-native-maps. |
| Time-Slot Selection Grid | Select court booking slots | LOW | Layout using FlatList or standard components. |
| Bottom Navigation | Seamless app navigation | LOW | expo-router bottom tab bar configuration. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Grab-like Matchmaking Button | 1-click on-demand teammate searching | LOW | Centered thumb-zone button. |
| Radar Sweep Animation | Real-time matchmaking feedback | MEDIUM | Continuous rotation using reanimated. |
| Interactive Bottom Sheet | Displays waiting "kèo" stats | MEDIUM | Uses @gorhom/bottom-sheet. |
| Segmented Match & Chat | Easily switch schedule and group chat | LOW | Custom segmented control UI. |
| Chat Quick Actions | 1-click view teammate location / court details | MEDIUM | Custom overlay or maps view inside chat. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time Map P2P Chatting | High engagement | High rendering cost on UI thread during animation | Group chat linked to specific match instead of free-form P2P map chat |

## Feature Dependencies

```
[On-demand Matchmaking] 
    └──requires──> [GPS Location Tracking]
                       └──requires──> [Home Dashboard]

[Group Chat Quick Actions] ──enhances──> [On-demand Matchmaking]
```

### Dependency Notes

- **On-demand Matchmaking requires GPS Location Tracking:** Matches must be found based on current coordinate distance.
- **Group Chat Quick Actions enhances On-demand Matchmaking:** Provides seamless coordination between teammates after matchmaking succeeds.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] Mobile Home Screen — Search, location, central "TÌM ĐỒNG ĐỘI NGAY" button.
- [ ] On-demand Matchmaking Screen — Map, radar sweep, bottom sheet with 1-tap join.
- [ ] Venue Booking Screen — Cards, time-slot selection grid, sticky bottom button.
- [ ] My Match & Chat Screen — Segmented control tab, group chat with quick actions.
- [ ] Dark Mode Neon Design — Compliant with thumb-zone ergonomics.

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Live Backend Syncing — Persisting real bookings.

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Payment Gateway Integration — Direct payments for court booking slots.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Home Dashboard | HIGH | LOW | P1 |
| Radar Map & Bottom Sheet | HIGH | MEDIUM | P1 |
| Venue Booking Grid | HIGH | MEDIUM | P1 |
| Match & Chat Segment | HIGH | LOW | P1 |
| Dark Mode styling | HIGH | LOW | P1 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Grab | CourtMate | Our Approach |
|---------|--------------|--------------|--------------|
| Matching Flow | Map-based driver searching | Map-based teammate searching | Radar effect animation, Bottom Sheet with kèo lists |

## Sources

- [Grab Matchmaking UI case study]
- [React Native design templates]

---
*Feature research for: CourtMate*
*Researched: 2026-06-18*
