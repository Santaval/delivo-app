import { AppDrawerContent } from '@/components/navigation/AppDrawerContent';
import { useThemeColor } from '@/hooks/useColorScheme';
import Drawer from 'expo-router/drawer';
import { useTranslation } from 'react-i18next';

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
    </Drawer>
  );
}
