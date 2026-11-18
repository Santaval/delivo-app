import { Spacing } from '@/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Height of the FloatingTabBar pill (without the safe-area offset below it). */
export const TAB_BAR_HEIGHT = 64;
/** Gap between the pill and the bottom safe-area edge. */
export const TAB_BAR_BOTTOM_GAP = Spacing.sm;

/**
 * Bottom space taken by the global FloatingTabBar (pill + safe area + gaps).
 * Use it as `paddingBottom` on scroll/list content, or as the `bottom` offset of
 * anything anchored to the bottom of the screen, so it isn't hidden behind the bar.
 */
export function useTabBarInset({ withFab = false }: { withFab?: boolean } = {}) {
  const insets = useSafeAreaInsets();
  const base = TAB_BAR_HEIGHT + insets.bottom + TAB_BAR_BOTTOM_GAP + Spacing.md;
  // Scroll content under a FloatingActionButton (56px, which sits at `base`)
  // also needs to clear the button so the last item stays tappable.
  return withFab ? base + 56 + Spacing.md : base;
}
