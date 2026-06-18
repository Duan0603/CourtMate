# Stack Research

**Domain:** React Native & Expo Mobile UI/UX Prototyping
**Researched:** 2026-06-18
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React Native | 0.74.x / 0.75.x | Core mobile application framework | Native performance, fast reload, excellent support for custom gesture UI. |
| Expo SDK | 51.0.0 (or latest stable) | Dev suite & ecosystem wrapper | Simplifies setup, asset compiling, local execution on real device via Expo Go. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-router | ^3.5.x | File-system based navigation | Used to structure navigation tabs (Home, Map Search, Schedule, Profile) and screen flow. |
| react-native-reanimated | ^3.10.x | High-performance UI thread animations | Essential for real-time Radar sweep effect and bottom sheet animations. |
| react-native-gesture-handler | ^2.16.x | Native touch handling | Needed for smooth swiping on bottom sheets and interactive cards. |
| @gorhom/bottom-sheet | ^4.6.x | Bottom Sheet interaction drawer | Custom bottom sheet for displaying matchmaking waiting list "kèo". |
| react-native-maps | ^1.14.x | Interactive map interface | Full-screen map visualization showing nearby players/venues. |
| expo-location | ^17.0.x | Retrieve device GPS coordinates | Setting and retrieving user's position for home and matchmaking views. |
| zustand | ^4.5.x | Lightweight state management | Simulating and sharing global mock matchmaking and chat status in-memory. |
| @expo/vector-icons | ^14.0.x | Icon components (Ionicons/FontAwesome) | Navigation bar items and sports category icons. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Expo CLI | Local dev server and builds | Run `npx expo start` to launch. |
| React Navigation DevTools | Debugging screen stack | Integrates nicely with expo-router. |

## Installation

```bash
# Core Expo Setup
npx create-expo-app@latest ./ --template blank

# Install Expo-integrated modules
npx expo install expo-router react-native-safe-area-context react-native-screens expo-location react-native-maps expo-system-ui

# Install Supporting Libraries
npm install @gorhom/bottom-sheet react-native-reanimated react-native-gesture-handler zustand
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Expo SDK | Vanilla React Native | When custom Native C++ modules or native library configurations are required (not needed for UI/UX prototype). |
| Zustand | Redux Toolkit | For large-scale projects with complex middleware (Zustand is much lighter and faster for prototypes). |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Vanilla `Animated` from React Native | Complex transforms run on JS thread and stutter when the thread is busy (e.g. while loading map marker data). | `react-native-reanimated` |
| `react-native-raw-bottom-sheet` | Lacks native gesture tracking and has poor support for scrollable content within bottom sheets. | `@gorhom/bottom-sheet` |

## Stack Patterns by Variant

**Greenfield Prototype (Phase 1):**
- Use Expo Go for local previewing without compiling native binaries.
- Implement UI views using standard components with rich CSS-in-JS (StyleSheet) configurations.

## Sources

- [Expo Official Documentation](https://docs.expo.dev/) — Navigation, location APIs verified.
- [React Native Reanimated Docs](https://docs.swmansion.com/react-native-reanimated/) — Thread performance verification.

---
*Stack research for: CourtMate*
*Researched: 2026-06-18*
