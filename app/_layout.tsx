import { AuthProvider } from "@/context/AuthContext";
import { CompaniesProvider } from "@/context/CompaniesContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return <AuthProvider>
    <CompaniesProvider>
      <Stack
        screenOptions={{ headerShown: false }}
      />
    </CompaniesProvider>
  </AuthProvider>;
}
