# Project Research Summary

**Project:** CourtMate
**Domain:** React Native & Expo Mobile UI/UX Prototyping
**Researched:** 2026-06-18
**Confidence:** HIGH

## Executive Summary

This research establishes the baseline for building the CourtMate mobile UI/UX and user flow prototype using React Native and Expo. The core objective is to deliver a high-fidelity mobile prototype simulating on-demand matchmaking (radar scanning and swipe-to-join) and slot-based venue booking.

The recommended stack centers around Expo SDK 51 with expo-router for file-system navigation, and react-native-reanimated for high-performance visual effects. Key risks include JS thread congestion during animation and gesture responder conflicts between the parent map and child bottom sheets. Both are mitigated by offloading animations to the UI thread and using native gesture handlers.

## Key Findings

### Recommended Stack

Summarized from [STACK.md](file:///d:/EXE101/.planning/research/STACK.md):
- **React Native & Expo SDK 51** (Core app engine)
- **expo-router** (Tab navigation layout)
- **react-native-reanimated** (Radar rotation & pings)
- **@gorhom/bottom-sheet** (Kèo details drawer)
- **react-native-maps** (Matchmaking map representation)
- **Zustand** (Mock state tracking)

### Expected Features

Summarized from [FEATURES.md](file:///d:/EXE101/.planning/research/FEATURES.md):
- **Must Have (Table Stakes)**: Navigation tabs, GPS home dashboard, map courts searching, slot grid selection.
- **Should Have (Differentiators)**: "TÌM ĐỒNG ĐỘI NGAY" central button, radar sweep animation, bottom sheet waitlists, segmented match/chat, chat quick actions.
- **Defer**: Real backend API syncing, payments integration.

### Architecture Approach

Summarized from [ARCHITECTURE.md](file:///d:/EXE101/.planning/research/ARCHITECTURE.md):
- Structured using expo-router standard layout with component boundaries separating presentation views (RadarScanner, TimeSlotGrid) from screen layouts. Zustand acts as the lightweight mock database.

### Critical Pitfalls

Summarized from [PITFALLS.md](file:///d:/EXE101/.planning/research/PITFALLS.md):
1. **JS Thread Congestion** — Solved by declaring animations in `react-native-reanimated` to run on the UI thread.
2. **Gesture conflicts** — Solved by wrapping map and sheets inside `GestureHandlerRootView` and using `@gorhom/bottom-sheet`.
3. **Safe Area clipping** — Solved by using `react-native-safe-area-context` hooks.

## Implications for Roadmap

Suggested phase structure:

### Phase 1: Foundation & On-Demand Matchmaking
**Rationale:** Matchmaking is the core value of CourtMate. Establishing the maps, radar, and bottom sheets first validates the main UX flow.
**Delivers:** Home Screen, Matchmaking Screen (full-screen Map + Radar + Bottom Sheet), navigation structure, and Zustand mockup state.

### Phase 2: Venue Booking & Match Control Center
**Rationale:** Booking slots and chatting completes the match cycle. These build directly on the mock database established in Phase 1.
**Delivers:** Venue Booking Screen (cards + time slot grid), My Match & Chat Screen (segmented tabs + chat message UI + quick action maps navigation).

### Phase Ordering Rationale

- Grouping is focused on getting the core matchmaking flow working first (Phase 1), followed by scheduling and slot management details (Phase 2).
- Helps avoid stack conflicts and allows early testing of map-gesture interaction before coding complex booking layouts.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Expo and react-native-reanimated are industry standard. |
| Features | HIGH | Directly maps to the user's detailed mobile screens specification. |
| Architecture | HIGH | Simple, clean React Native file-system structure. |
| Pitfalls | HIGH | Known animation and touch gesture challenges are well-documented. |

**Overall confidence:** HIGH

## Sources

### Primary (HIGH confidence)
- [Expo Docs](https://docs.expo.dev/) — Navigation, map components, and location APIs.
- [React Native Gesture Handler Guide](https://software-mansion.github.io/react-native-gesture-handler/) — Touch resolution methods.

---
*Research completed: 2026-06-18*
*Ready for roadmap: yes*
