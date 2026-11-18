import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Routes, Shadows, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import { TAB_BAR_BOTTOM_GAP, TAB_BAR_HEIGHT } from '@/hooks/useTabBarInset';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { Href } from 'expo-router';
import { router, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


type TabKey = 'home' | 'orders' | 'routes' | 'clients';

type TabEntry = {
  key: TabKey;
  labelKey: string;
  href: Href;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
};

const TABS: TabEntry[] = [
  { key: 'home', labelKey: 'home', href: Routes.home, icon: 'home' },
  { key: 'orders', labelKey: 'orders', href: Routes.orders, icon: 'shopping-basket' },
  { key: 'routes', labelKey: 'routes', href: Routes.routes, icon: 'map' },
  { key: 'clients', labelKey: 'clients', href: Routes.clients, icon: 'people' },
];

const TAB_PATHS: Record<TabKey, string> = {
  home: '/home',
  orders: '/orders',
  routes: '/routes',
  clients: '/clients',
};

/** Screens where the bar would be in the way (terminal / modal-like flows). */
const HIDDEN_PATHS = ['/plan-limit', '/delete-account/done'];

/** Which tab a pathname belongs to. Secondary sections (bills, products, team,
 *  account, company switcher…) are reached from Home, so they light up Inicio. */
function tabForPath(pathname: string): TabKey {
  if (pathname.startsWith('/orders')) return 'orders';
  if (pathname.startsWith('/routes')) return 'routes';
  if (pathname.startsWith('/clients')) return 'clients';
  return 'home';
}

function useKeyboardVisible() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setVisible(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
}

/**
 * Floating pill tab bar rendered once above the root stack (see app/_layout.tsx),
 * so the main tabs are reachable from every signed-in screen — pushed screens
 * included. The built-in bar of app/(main)/(tabs) is hidden.
 */
export function FloatingTabBar() {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const keyboardVisible = useKeyboardVisible();

  if (keyboardVisible || HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null;

  const activeTab = tabForPath(pathname);

  const handlePress = (tab: TabEntry) => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const onTabRoot = pathname === TAB_PATHS[tab.key];
    if (onTabRoot) return;

    // From a screen pushed on the root stack, pop back down to (main) first so
    // tapping a tab never stacks screens; then switch to the tab.
    if (router.canDismiss()) router.dismissAll();
    router.navigate(tab.href);
  };

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: insets.bottom + TAB_BAR_BOTTOM_GAP }]}
    >
      <View
        accessibilityRole="tablist"
        style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        {TABS.map((tab) => {
          const selected = tab.key === activeTab;
          const tint = selected ? colors.text : colors.tabIconDefault;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={t(tab.labelKey)}
              onPress={() => handlePress(tab)}
              style={({ pressed }) => [
                styles.item,
                selected && { backgroundColor: colors.backgroundTertiary },
                pressed && styles.pressed,
              ]}
            >
              <MaterialIcons name={tab.icon} size={24} color={tint} />
              <ThemedText
                numberOfLines={1}
                style={[styles.label, { color: tint }, selected && styles.labelSelected]}
              >
                {t(tab.labelKey)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: TAB_BAR_HEIGHT,
    padding: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
    ...Shadows.medium,
  },
  item: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: BorderRadius.full,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: 16,
  },
  labelSelected: {
    fontWeight: Typography.fontWeight.bold,
  },
});
