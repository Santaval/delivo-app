import { AppDrawerContent } from '@/components/navigation/AppDrawerContent';
import { useThemeColor } from '@/hooks/useColorScheme';
import Drawer from 'expo-router/drawer';
import { useTranslation } from 'react-i18next';

// `getLayoutNode` deriva el anchor de un hijo cuyo nombre coincida con el del
// grupo; `(drawer)` no tiene ningún hijo llamado "drawer", así que sin esto un
// deep link a /bills deja el drawer sin historial de tabs.
export const unstable_settings = { anchor: '(tabs)' };

export default function DrawerLayout() {
  const colors = useThemeColor();
  const { t } = useTranslation();

  return (
    <Drawer
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
      <Drawer.Screen name="bills" options={{ title: t('bills') }} />
      <Drawer.Screen name="products" options={{ title: t('products') }} />
      <Drawer.Screen name="account" options={{ title: t('account') }} />
    </Drawer>
  );
}
