# AGENTS.md

## Project Overview

Expo/React Native mobile app (Delivo) for small business expense/income tracking + route optimization. Uses Expo SDK 54 with the New Architecture enabled.

## Commands

- `npm start` — start Expo dev server
- `npm run android` / `npm run ios` — run on device/emulator
- `npm run web` — start web dev server
- `npm run lint` — ESLint via `expo lint`
- No test runner is configured

## Architecture

- **Routing**: Expo Router (file-based) with typed routes (`experiments.typedRoutes: true`). Entry: `app/_layout.tsx` → `app/(tabs)/_layout.tsx`
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