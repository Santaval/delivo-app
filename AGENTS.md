# AGENTS.md

## Project Overview

Expo/React Native mobile app (Delivo) for small business expense/income tracking + route optimization. Uses Expo SDK 54 with the New Architecture enabled.

## Commands

- `npm start` — start Expo dev server
- `npm run android` / `npm run ios` — run on device/emulator
- `npm run web` — start web dev server
- `npm run lint` — ESLint via `expo lint`
- `npm test` — Jest (jest-expo)

## Architecture

- **Routing**: Expo Router (file-based) with typed routes (`experiments.typedRoutes: true`). Entry: `app/_layout.tsx` → `app/(drawer)/_layout.tsx` → `app/(drawer)/(tabs)/_layout.tsx`
- **Auth**: `AuthContext` wraps the app; token stored in `expo-secure-store`; `services/auth/Auth.service.ts` handles Google/Apple sign-in
- **State**: React Context (`AuthContext`, `CompaniesContext`, `RouteContext`). No external state library.
- **API**: Axios client in `services/api.ts`, base URL from `EXPO_PUBLIC_API_URL` env var
- **i18n**: react-i18next, default language is **Spanish** (`es`), fallback `es`. Locales in `i18n/locales/`
- **Moment**: locale forced to `es` via `moment/moment.ts`
- **Theme**: `useColorScheme` follows the device setting; read colors via `useThemeColor()` only. Direct `Colors.light`/`Colors.dark` access is blocked by ESLint (see `THEME_STRATEGY.md`)
- **React Compiler**: enabled (`experiments.reactCompiler: true`)

## Path Aliases

- `@/*` maps to project root (e.g. `@/components`, `@/constants`, `@/services`, `@/hooks`)

## Environment

Requires `.env` with (see `.env.example`):
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_API_KEY`  
- `EXPO_PUBLIC_COMPANY_ID`
- `EXPO_PUBLIC_IOS_ADMOB_KEY` / `EXPO_PUBLIC_ANDROID_ADMOB_KEY`

All env vars must be prefixed with `EXPO_PUBLIC_` for Expo to expose them to the client.

## Key Conventions

- **Types**:Declared as `.d.ts` files in `types/` (not `.ts`)
- **Services**: Organized by domain in `services/` (auth, clients, companies, orders, products, routes, stats, etc.)
- **Hooks**: Domain-specific hooks in `hooks/` (e.g. `useOrders`, `useBills`, `useClients`)
- **Components**: Themed components (`ThemedText`, `ThemedView`, `BusinessCard`) in `components/`; domain components in subfolders (`bills/`, `clients/`, `orders/`, `routes/`, `maps/`, `currency/`, `financial/`)
- **Barrel exports**: `components/index.ts`, `constants/index.ts`, `hooks/index.ts`

## Lint

Uses `eslint-config-expo` (flat config). Ignores `dist/`.

## Live driver location

- The route's driver (`route.driverId === user.id`) shares their position while the route is `STARTED`: `hooks/useDriverTracking.ts` (permissions, start/stop/pause) and the headless task `services/tracking/LocationTracking.task.ts` (`TaskManager.defineTask` at module level, imported from `app/_layout.tsx`). Pure logic in `LocationTracking.core.ts`; the task reads the JWT from SecureStore (`token`) and the route/company/offline buffer from AsyncStorage, and builds its own request headers. It stops on 403/404/409.
- `RouteScreenManager` starts/stops tracking and provides it via `DriverTrackingContext` (indicator: `components/routes/TrackingIndicator.tsx`).
- OWNER/ADMIN watch the driver with `hooks/useDriverLiveLocation.ts` (SSE via `react-native-sse`, backoff, polling fallback, closes in background) and `DeliveryMap` renders `components/maps/DriverMarker.tsx`.
- Needs a native build (background location, foreground service). Store declarations: `docs/live-location-store-submission.md`.

