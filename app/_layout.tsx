import { AuthProvider } from "@/context/AuthContext";
import { CompaniesProvider } from "@/context/CompaniesContext";
import { PurchasesProvider } from "@/context/PurchasesContext";
import config from "@/config/env";
import MapboxGL from "@rnmapbox/maps";
import { Stack } from "expo-router";
import 'moment/locale/es';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RevenueCatService from "@/services/purchases/RevenueCat.service";
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://415b7add0823f1f9128a02aa6fed1e25@o4511549122084864.ingest.us.sentry.io/4511549124050944',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});
import '../i18n'; // Initialize i18n
import '../moment/moment'; // Initialize moment with locale

MapboxGL.setAccessToken(config.mapboxAccessToken);
RevenueCatService.configure();

export default function RootLayout() {
  return (
    <AuthProvider>
      <CompaniesProvider>
        <PurchasesProvider>
          <GestureHandlerRootView>
            <Stack screenOptions={{ headerShown: false }} />
          </GestureHandlerRootView>
        </PurchasesProvider>
      </CompaniesProvider>
    </AuthProvider>
  );
}
export default Sentry.wrap(function RootLayout() {
  return <AuthProvider>
    <CompaniesProvider>
      <GestureHandlerRootView>
        <Stack
          screenOptions={{ headerShown: false }}
        />
      </GestureHandlerRootView>
    </CompaniesProvider>
  </AuthProvider>;
});
