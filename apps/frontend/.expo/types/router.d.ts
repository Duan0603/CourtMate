/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/chat` | `/(tabs)/home` | `/(tabs)/profile` | `/(tabs)/tracker` | `/_sitemap` | `/admin` | `/chat` | `/edit-profile` | `/home` | `/payment/cancel` | `/payment/return` | `/profile` | `/tracker`;
      DynamicRoutes: `/payment/${Router.SingleRoutePart<T>}` | `/register/${Router.SingleRoutePart<T>}` | `/ticket/${Router.SingleRoutePart<T>}` | `/tournament/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/payment/[tournamentId]` | `/register/[tournamentId]` | `/ticket/[tournamentId]` | `/tournament/[id]`;
    }
  }
}
