import { AppDrawerContent } from '@/components/navigation/AppDrawerContent';
import { useCompanies } from '@/context/CompaniesContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import Drawer from 'expo-router/drawer';
import { useTranslation } from 'react-i18next';

export default function DrawerLayout() {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const { activeCompany } = useCompanies();

  return (
    // Keyed by the active company: switching company remounts the drawer and the
    // tabs beneath it, so every screen drops its company-scoped state/fetches and
    // reloads for the new company. Only this subtree needs it: the switcher is
    // reachable solely from the drawer, so no other company-scoped screen can be
    // open underneath it, and RouteContext is per-screen (mounted by routes/view/[id]).
    <Drawer
      key={activeCompany?.id}
      screenOptions={{
        headerShown: false, // cada pantalla trae su propio TopBar
        drawerType: 'front', // escena estática, panel+overlay encima — más predecible con la tab bar iOS en `position:'absolute'`
        drawerPosition: 'left',
        drawerStyle: { backgroundColor: colors.background, width: 300 },
        overlayColor: 'rgba(0,0,0,0.4)',
        sceneStyle: { backgroundColor: colors.background },
        swipeEnabled: true,
        swipeEdgeWidth: 40,
      }}
      drawerContent={(props) => <AppDrawerContent {...props} />}
    >
      <Drawer.Screen name="(tabs)" options={{ title: t('home') }} />
    </Drawer>
  );
}
