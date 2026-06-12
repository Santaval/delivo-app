import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { OfflineBanner } from "@/components/feedback/OfflineBanner";
import config from "@/config/env";
import { AuthProvider } from "@/context/AuthContext";
import { CompaniesProvider } from "@/context/CompaniesContext";
import { PurchasesProvider } from "@/context/PurchasesContext";
import { ToastProvider } from "@/context/ToastContext";
import RevenueCatService from "@/services/purchases/RevenueCat.service";
import MapboxGL from "@rnmapbox/maps";
import * as Sentry from '@sentry/react-native';
import { ObserveRoot } from 'expo-observe';
import { Stack } from "expo-router";
import 'moment/locale/es';
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

function RootLayout() {
  return (
    <AuthProvider>
      <CompaniesProvider>
        <PurchasesProvider>
          <GestureHandlerRootView>
            <ToastProvider>
              <ErrorBoundary>
                <Stack screenOptions={{ headerShown: false }} />
                <OfflineBanner />
              </ErrorBoundary>
            </ToastProvider>
          </GestureHandlerRootView>
        </PurchasesProvider>
      </CompaniesProvider>
    </AuthProvider>
  );
}

export default Sentry.wrap(ObserveRoot.wrap(RootLayout));
