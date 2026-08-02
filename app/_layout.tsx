import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { OfflineBanner } from "@/components/feedback/OfflineBanner";
import config from "@/config/env";
import { Routes } from "@/constants";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CompaniesProvider, useCompanies } from "@/context/CompaniesContext";
import { PlanLimitProvider, usePlanLimit } from "@/context/PlanLimitContext";
import { PurchasesProvider } from "@/context/PurchasesContext";
import { ToastProvider } from "@/context/ToastContext";
import RevenueCatService from "@/services/purchases/RevenueCat.service";
import MapboxGL from "@rnmapbox/maps";
import * as Sentry from '@sentry/react-native';
import * as SplashScreen from 'expo-splash-screen';
import { ObserveRoot } from 'expo-observe';
import { router, Stack } from "expo-router";
import 'moment/locale/es';
import { useEffect } from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../i18n';
import '../moment/moment';

Sentry.init({
  dsn: 'https://415b7add0823f1f9128a02aa6fed1e25@o4511549122084864.ingest.us.sentry.io/4511549124050944',
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
});

MapboxGL.setAccessToken(config.mapboxAccessToken);
RevenueCatService.configure();
SplashScreen.preventAutoHideAsync();

/**
 * The 402 interceptor only flips state in PlanLimitContext; the navigation to
 * the plan-limit route is decided here, next to the route tree.
 */
function PlanLimitNavigator() {
  const { shouldShowPlanLimit } = usePlanLimit();
  useEffect(() => {
    if (shouldShowPlanLimit) router.push(Routes.planLimit);
  }, [shouldShowPlanLimit]);
  return null;
}

function RootNavigator() {
  const { authState } = useAuth();
  const { activeCompany, isLoadingActiveCompany, needsCompanySelection } =
    useCompanies();
  // Auth must resolve first; the company only matters once we know there is a session.
  const isBootstrapping = authState.isLoading || (authState.authenticated && isLoadingActiveCompany);

  const isAuthenticated = authState.authenticated;
  const hasActiveCompany = !!activeCompany;

  // The navigator stays mounted while bootstrapping — the native splash covers
  // it, so nothing intermediate is visible, and the router is ready to receive
  // the first navigation as soon as the session resolves.
  useEffect(() => {
    if (!isBootstrapping) SplashScreen.hideAsync().catch(() => {});
  }, [isBootstrapping]);

  return (
    <ErrorBoundary>
      {/* Single source of truth for route access. Every file under app/ must be
          declared here — an undeclared route is auto-registered by expo-router
          and would stay unguarded. Declaration order also matters: when the
          focused screen's guard turns false, expo-router falls back to the
          first still-available screen in declaration order, so the order below
          determines where each auth/company state lands the user. */}
      <Stack screenOptions={{ headerShown: false }}>
        {/* Signed out: the login screen and the OAuth callback are the only reachable routes */}
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="index" />
          <Stack.Screen name="oauthredirect" />
        </Stack.Protected>

        {/* Signed in without an active company: onboarding. `select` is declared
            first so a user who already has companies lands there instead of `add`.
            `add` stays available through the whole onboarding state (including
            while the company is still resolving) so the stack is never empty. */}
        <Stack.Protected guard={needsCompanySelection}>
          <Stack.Screen name="companies/select" />
        </Stack.Protected>
        <Stack.Protected guard={isAuthenticated && !hasActiveCompany}>
          <Stack.Screen name="companies/add" />
        </Stack.Protected>

        {/* Fully signed in */}
        <Stack.Protected guard={isAuthenticated && hasActiveCompany}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="bills/view/[id]" />
          <Stack.Screen name="clients/add" />
          <Stack.Screen name="clients/edit/[id]" />
          <Stack.Screen name="clients/profile/[id]" />
          <Stack.Screen name="orders/create" />
          <Stack.Screen name="orders/view/[id]" />
          <Stack.Screen name="payment-methods/add" />
          <Stack.Screen name="plan-limit" />
          <Stack.Screen name="products/add" />
          <Stack.Screen name="products/edit/[id]" />
          <Stack.Screen name="products/view/[id]" />
          <Stack.Screen name="routes/create" />
          <Stack.Screen name="routes/view/[id]" />
          <Stack.Screen name="routes/view/addOrders" />
        </Stack.Protected>
      </Stack>
      <PlanLimitNavigator />
      <OfflineBanner />
    </ErrorBoundary>
  );
}

function RootLayout() {
  return (
    <AuthProvider>
      <CompaniesProvider>
        <PurchasesProvider>
          <GestureHandlerRootView>
            <ToastProvider>
              <PlanLimitProvider>
                <RootNavigator />
              </PlanLimitProvider>
            </ToastProvider>
          </GestureHandlerRootView>
        </PurchasesProvider>
      </CompaniesProvider>
    </AuthProvider>
  );
}

export default Sentry.wrap(ObserveRoot.wrap(RootLayout));
