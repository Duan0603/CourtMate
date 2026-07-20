/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/chat` | `/(tabs)/dashboard` | `/(tabs)/profile` | `/(tabs)/tracker` | `/..\src\dashboard\` | `/..\src\dashboard\AdminDashboard` | `/..\src\dashboard\OrganizerDashboard` | `/..\src\dashboard\RoleGuard` | `/..\src\dashboard\mockData` | `/..\src\dashboard\organizerMockData` | `/..\src\data\tournament-mocks` | `/..\src\features\dashboard\screens\DashboardScreen` | `/_sitemap` | `/admin\` | `/chat` | `/dashboard` | `/edit-profile` | `/organizer\` | `/profile` | `/tracker`;
      DynamicRoutes: `/payment/${Router.SingleRoutePart<T>}` | `/register/${Router.SingleRoutePart<T>}` | `/ticket/${Router.SingleRoutePart<T>}` | `/tournament/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/payment/[tournamentId]` | `/register/[tournamentId]` | `/ticket/[tournamentId]` | `/tournament/[id]`;
    }
  }
}
