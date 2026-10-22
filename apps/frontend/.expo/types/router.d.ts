/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/..\src\features\auth\screens\StartScreen` | `/_sitemap` | `/tracker`;
      DynamicRoutes: `/register/${Router.SingleRoutePart<T>}` | `/tournament/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/register/[tournamentId]` | `/tournament/[id]`;
    }
  }
}
