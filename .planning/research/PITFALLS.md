# Pitfalls Research

**Domain:** React Native & Expo Mobile UI/UX Prototyping
**Researched:** 2026-06-18
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: JS Thread Congestion during Radar Scanning

**What goes wrong:**
Radar scan animation stutters, drops frames, or freezes when markers are rendering or maps are updating.

**Why it happens:**
JavaScript thread performs heavy processing (calculating mock marker distances, filtering list states) while running animations.

**How to avoid:**
Use `react-native-reanimated` which runs animations entirely on the native UI thread, keeping them smooth regardless of JS thread load.

**Warning signs:**
Visual lag when switching sheets or starting search; UI thread FPS dropping below 60.

**Phase to address:**
Phase 1 (Matchmaking view implementation).

---

### Pitfall 2: Map Swipe Conflict with Bottom Sheet Gestures

**What goes wrong:**
Swiping up/down on the bottom sheet causes the parent MapView to drag or scroll instead of moving the bottom sheet.

**Why it happens:**
React Native gesture responder conflict — map view and bottom sheet competing for touch events.

**How to avoid:**
Wrap the bottom sheet and container inside `GestureHandlerRootView` and use the native-tracked bottom sheet component `@gorhom/bottom-sheet` which resolves gesture conflicts internally.

**Warning signs:**
Jittery sheet movement, sheets locking up when dragged over the map.

**Phase to address:**
Phase 1 (Matchmaking view implementation).

---

### Pitfall 3: Screen Clipping due to Incomplete Safe Area Handling

**What goes wrong:**
Navigation items or sticky buttons at the bottom of the screens clip under the home indicator / physical notches of iPhone and Android devices.

**Why it happens:**
Developers hardcode padding/margin values without respecting device Safe Area boundaries.

**How to avoid:**
Use `react-native-safe-area-context` and wrap screens in `SafeAreaView` or consume the hook `useSafeAreaInsets()`.

**Warning signs:**
Bottom navigation icons overlapping iPhone bar, sticky buttons partially cut off on Android devices.

**Phase to address:**
Phase 1 (Layout initialization).

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| In-memory Zustand mock data | Faster implementation, no backend needed | Must re-wire all data queries once Backend API is ready | Perfect for MVP/UI design validation |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Buttons outside "Thumb Zone" | User has to use both hands to tap important actions | Place primary actions (TÌM ĐỒNG ĐỘI NGAY, Đặt sân) in the lower half of screen |

## "Looks Done But Isn't" Checklist

- [ ] **On-demand matchmaking radar:** Often looks nice statically but fails to loop infinitely — verify it scans continuously without stopping.
- [ ] **Time-slot grid layout:** Often looks aligned on iPhone but breaks or wraps weirdly on smaller screen widths — verify grid columns scale correctly.

---
*Pitfalls research for: CourtMate*
*Researched: 2026-06-18*
