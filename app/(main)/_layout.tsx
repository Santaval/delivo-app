import { useCompanies } from '@/context/CompaniesContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import { Stack } from 'expo-router';

export default function MainLayout() {
  const colors = useThemeColor();
  const { activeCompany } = useCompanies();

  return (
    // Keyed by the active company: switching company remounts the tabs beneath
    // it, so every screen drops its company-scoped state/fetches and reloads for
    // the new company. Only this subtree needs it: the switcher is reachable
    // solely from Home's header, so no other company-scoped screen can be open
    // underneath it, and RouteContext is per-screen (mounted by routes/view/[id]).
    <Stack
      key={activeCompany?.id}
      screenOptions={{
        headerShown: false, // cada pantalla trae su propio encabezado
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
