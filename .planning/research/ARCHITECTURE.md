# Architecture Research

**Domain:** React Native & Expo Mobile UI/UX Prototyping
**Researched:** 2026-06-18
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       Presentation Layer                    │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐ │
│  │ HomeScreen│  │ MapScreen │  │BookingScrn│  │ChatScreen │ │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘ │
│        │              │              │              │       │
├────────┼──────────────┼──────────────┼──────────────┼───────┤
│        │              │              │              │       │
│  ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐        │       │
│  │ SportIcons│  │ RadarMap  │  │SlotGridUI │        │       │
│  └───────────┘  │BottomShetr│  └───────────┘        │       │
│                 └─────┬─────┘                       │       │
├───────────────────────┼─────────────────────────────┼───────┤
│                       State / Data Layer            │
├───────────────────────┼─────────────────────────────┼───────┤
│                 ┌─────▼─────────────────────────────▼─────┐ │
│                 │               Zustand Store             │ │
│                 │           (useMatchStore.js)            │ │
│                 └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| RadarMap | Visualizes real-time user positioning and surrounding players | `react-native-maps` MapView + animated SVGs for radar sweeps |
| BottomSheet | Sliding card at bottom of screen carrying waitlist slots | `@gorhom/bottom-sheet` BottomSheetModal |
| SlotGridUI | Layout grid displaying selection items for booking times | custom FlatList with 3-column matrix grid |
| useMatchStore | Central store tracking matches, chats, and geolocation | `Zustand` memory store with initial seed states |

## Recommended Project Structure

```
App.js                    # App entry point
app/                      # expo-router file navigation structure
├── (tabs)/               # Bottom tab bar folder
│   ├── _layout.js        # Tab layout and styling
│   ├── index.js          # Home screen (Trang chủ)
│   ├── matchmaking.js    # On-demand radar screen (Bản đồ)
│   ├── schedule.js       # Schedule and chat segmented control (Lịch trình)
│   └── profile.js        # Profile settings (Hồ sơ)
├── booking.js            # Venue booking screen
└── _layout.js            # General routing layout
components/               # Reusable presentation views
├── BottomSheetView.js    # Matches details list
├── RadarScanner.js       # Real-time search radar waves
├── TimeSlotGrid.js       # Color-coded slots selector
└── CustomSegmentControl.js# Toggle switch for match/chat
store/                    # Global state definition
└── useMatchStore.js      # Zustand store for mock data
constants/                # Theme, constants, assets
└── Colors.js             # Dark Mode & Lime Green color configuration
```

### Structure Rationale

- **app/(tabs)/**: Integrates directly with expo-router for native-like bottom tab bar navigation.
- **components/**: Kept separate from routing screens to ensure components are clean, reusable, and testable.
- **store/**: Simple, single store using Zustand is sufficient for mock-data simulations (minimizing rendering cycles).

## Architectural Patterns

### Pattern 1: Declarative Animations (Reanimated)

**What:** Animations are declared via shared values and executed on the native UI thread, bypassing JavaScript bridge congestion.
**When to use:** Rotating radar scanning sweep and scale pings on the matchmaking view.
**Trade-offs:** Steeper learning curve than vanilla Animated API, but avoids frames stalling.

**Example:**
```javascript
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';

// Pulse scale animation
const scale = useSharedValue(1);
useEffect(() => {
  scale.value = withRepeat(withTiming(2, { duration: 1500 }), -1);
}, []);
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Greenfield mock state structure; simple client-side logic. |
| 1k-100k users | Replace Zustand mock data with queries to backend APIs (GraphQL or REST) + local caching. |

## Sources

- [React Native Directory Structure Guide](https://reactnative.dev/docs/directory-structure)
- [Gorhom Bottom Sheet Architecture](https://ui.gorhom.dev/components/bottom-sheet)

---
*Architecture research for: CourtMate*
*Researched: 2026-06-18*
