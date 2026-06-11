import { AuthProvider } from "@/context/AuthContext";
import { CompaniesProvider } from "@/context/CompaniesContext";
import { PurchasesProvider } from "@/context/PurchasesContext";
import config from "@/config/env";
import MapboxGL from "@rnmapbox/maps";
import { Stack } from "expo-router";
import 'moment/locale/es';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RevenueCatService from "@/services/purchases/RevenueCat.service";
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
