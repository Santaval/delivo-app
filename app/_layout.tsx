import { AuthProvider } from "@/context/AuthContext";
import { CompaniesProvider } from "@/context/CompaniesContext";
import config from "@/config/env";
import MapboxGL from "@rnmapbox/maps";
import { Stack } from "expo-router";
import 'moment/locale/es';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../i18n'; // Initialize i18n
import '../moment/moment'; // Initialize moment with locale

MapboxGL.setAccessToken(config.mapboxAccessToken);

export default function RootLayout() {
  return <AuthProvider>
    <CompaniesProvider>
      <GestureHandlerRootView>
        <Stack
          screenOptions={{ headerShown: false }}
        />
      </GestureHandlerRootView>
    </CompaniesProvider>
  </AuthProvider>;
}
