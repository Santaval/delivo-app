import { AuthProvider } from "@/context/AuthContext";
import { CompaniesProvider } from "@/context/CompaniesContext";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
