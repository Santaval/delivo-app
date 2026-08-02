import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { OfflineBanner } from "@/components/feedback/OfflineBanner";
import config from "@/config/env";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CompaniesProvider, useCompanies } from "@/context/CompaniesContext";
import { PlanLimitProvider } from "@/context/PlanLimitContext";
import { PurchasesProvider } from "@/context/PurchasesContext";
import { ToastProvider } from "@/context/ToastContext";
import RevenueCatService from "@/services/purchases/RevenueCat.service";
import MapboxGL from "@rnmapbox/maps";
import * as Sentry from '@sentry/react-native';
import * as SplashScreen from 'expo-splash-screen';
import { ObserveRoot } from 'expo-observe';
import { Stack } from "expo-router";
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

function RootNavigator() {
  const { authState } = useAuth();
  const { isLoadingActiveCompany } = useCompanies();
  // Auth must resolve first; the company only matters once we know there is a session.
  const isBootstrapping = authState.isLoading || (authState.authenticated && isLoadingActiveCompany);

  // The navigator stays mounted while bootstrapping — the native splash covers
  // it, so nothing intermediate is visible, and the router is ready to receive
  // the first navigation as soon as the session resolves.
  useEffect(() => {
    if (!isBootstrapping) SplashScreen.hideAsync().catch(() => {});
  }, [isBootstrapping]);

  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }} />
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
