import { DrawerActions } from 'expo-router/react-navigation';
import { useNavigation } from 'expo-router';
import { useCallback } from 'react';

/** Coincide con el id que expo-router deriva de app/(drawer)/_layout.tsx. */
const DRAWER_LAYOUT = '/(drawer)';

export function useDrawer() {
  const navigation = useNavigation(DRAWER_LAYOUT);
  const openDrawer = useCallback(() => navigation.dispatch(DrawerActions.openDrawer()), [navigation]);
  const closeDrawer = useCallback(() => navigation.dispatch(DrawerActions.closeDrawer()), [navigation]);
  return { openDrawer, closeDrawer };
}
