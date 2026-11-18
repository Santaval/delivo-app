import { Routes, Shadows, Spacing } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFooter, type BottomSheetFooterProps } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import React, { useCallback, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Height of the sticky footer (a 56px SwipeButton + padding). */
export const ROUTE_SHEET_FOOTER_HEIGHT = 56 + Spacing.md + Spacing.lg;
/** Height of the collapsed sheet: handle + a title row + the sticky footer. */
const COLLAPSED_CONTENT_HEIGHT = 24 + 64;
/** Size of the floating back button over the map (top-left). */
export const ROUTE_BACK_BUTTON_SIZE = 44;
/** Fraction of the screen the sheet opens at. */
const HALF_RATIO = 0.4;

/**
 * Space the sheet covers at its resting (half) position, measured from the
 * bottom of the screen. Pass it to the map so the route is framed in the part
 * of the map that stays visible above the sheet.
 */
export function useRouteSheetCoverage() {
  const { height } = useWindowDimensions();
  return Math.round(height * HALF_RATIO);
}

type RouteMapSheetProps = {
  /** Rendered full-screen behind the sheet. */
  map: ReactNode;
  /** Pinned to the bottom of the sheet at every snap point (e.g. a SwipeButton). */
  footer?: ReactNode;
  /** Small overlay in the map's top-right corner, level with the back button. */
  topRight?: ReactNode;
  /** Sheet body; use BottomSheetScrollView / BottomSheetFlatList for scrolling content
   *  and give it `paddingBottom: ROUTE_SHEET_FOOTER_HEIGHT` when there is a footer. */
  children: ReactNode;
};

/**
 * Full-screen map with a swipe-up sheet over it (collapsed / ~40% / ~90%),
 * used by the route planning and delivery screens. The global FloatingTabBar
 * is hidden on these screens (see FloatingTabBar's isRouteView).
 */
export function RouteMapSheet({ map, footer, topRight, children }: RouteMapSheetProps) {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.navigate(Routes.routes);
  };

  const snapPoints = useMemo(
    () => [
      COLLAPSED_CONTENT_HEIGHT + (footer ? ROUTE_SHEET_FOOTER_HEIGHT : 0) + insets.bottom,
      `${HALF_RATIO * 100}%`,
      '90%',
    ],
    [footer, insets.bottom],
  );

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props}>
        <View
          style={[
            styles.footer,
            // The sheet runs to the screen edge; keep the button above the home indicator.
            { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Spacing.lg + insets.bottom },
          ]}
        >
          {footer}
        </View>
      </BottomSheetFooter>
    ),
    [footer, colors.surface, colors.border, insets.bottom],
  );

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>{map}</View>

      {/* There is no header on this screen, so back lives on the map */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + Spacing.sm, backgroundColor: colors.surface }]}
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel={t('back')}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <MaterialIcons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>

      {topRight ? (
        <View style={[styles.topRight, { top: insets.top + Spacing.sm }]}>{topRight}</View>
      ) : null}

      <BottomSheet
        index={1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        // The floating tab bar is hidden on this screen, so the sheet runs to the
        // bottom edge; it never covers the status bar.
        topInset={insets.top}
        // Horizontal drags belong to the swipe buttons inside the sheet.
        activeOffsetY={[-10, 10]}
        failOffsetX={[-10, 10]}
        footerComponent={footer ? renderFooter : undefined}
        backgroundStyle={[styles.background, { backgroundColor: colors.surface }]}
        handleIndicatorStyle={{ backgroundColor: colors.borderSecondary }}
        style={styles.sheetShadow}
      >
        {children}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topRight: {
    position: 'absolute',
    right: Spacing.lg,
  },
  backButton: {
    position: 'absolute',
    left: Spacing.lg,
    width: ROUTE_BACK_BUTTON_SIZE,
    height: ROUTE_BACK_BUTTON_SIZE,
    borderRadius: ROUTE_BACK_BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
  },
  background: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
