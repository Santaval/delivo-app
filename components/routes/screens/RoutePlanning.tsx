import { SwipeButton, TopBar } from '@/components';
import Map from '@/components/maps/Map';
import RouteDriverSection from '@/components/routes/RouteDriverSection';
import { ROUTE_SHEET_FOOTER_HEIGHT, RouteMapSheet, useRouteSheetCoverage } from '@/components/routes/RouteMapSheet';
import { BorderRadius, Routes, Spacing, Typography } from '@/constants';
import { useRoute } from '@/context/RouteContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RoutePlanningScreen() {

  const { route, isLoading, error, startNavigation } = useRoute();
  const { t } = useTranslation();
  const colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const sheetCoverage = useRouteSheetCoverage();

  const renderStopItem = ({ item, index }: { item: RoutePoint; index: number }) => (
    <View style={[styles.stopItem, { borderBottomColor: colors.border }]}>
      <View style={[styles.stopNumber, { backgroundColor: colors.primary }]}>
        <Text style={[styles.stopNumberText, { color: colors.textInverse }]}>{index + 1}</Text>
      </View>

      <View style={styles.stopContent}>
        <Text style={[styles.stopName, { color: colors.text }]}>{item.order.client.name}</Text>
        <Text style={[styles.stopAddress, { color: colors.textSecondary }]}>
          {/* Mock address - replace with actual client address */}
         {item.order.items.map((i) => i.name).join(", ")}
        </Text>
      </View>

      {/* <View style={styles.stopTime}>
        <Text style={styles.timeText}>{formatEstimatedArrival(index)}</Text>
        <Text style={styles.timeLabel}>{t('arrivalEst')}</Text>
      </View> */}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <TopBar title={t('routeMap')} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('loadingRoute')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !route) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <TopBar title={t('routeMap')} />
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: colors.danger }]}>{error || t('routeNotFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <RouteMapSheet
      map={
        <Map
          markers={route.points.map((point) => ({
            coordinate: {
              latitude: point.order.client.location.lat || 37.7749,
              longitude: point.order.client.location.lng || -122.4194,
            },
            title: point.order.client.name,
            description: 'Delivery stop',
            backgroundColor: colors.primary,
          }))}
          polylines={route.polyline}
          fitToMarkers
          fitInsets={{ top: insets.top, bottom: sheetCoverage }}
        />
      }
      footer={
        <SwipeButton
          onSwipeComplete={startNavigation}
          text={isLoading ? t("optimizingRoute") : t("slideToStartNavigation")}
          isLoading={isLoading}
          iconName="navigate"
          backgroundColor={colors.success}
          style={styles.navigationButton}
        />
      }
    >
      <BottomSheetFlatList
        data={route.points}
        keyExtractor={(item: RoutePoint, index: number) => `${item.id}-${index}`}
        renderItem={renderStopItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.sheetContent, { paddingBottom: ROUTE_SHEET_FOOTER_HEIGHT + Spacing.lg + insets.bottom }]}
        ListHeaderComponent={
          <>
            {/* Title row: visible even when the sheet is collapsed */}
            <View style={styles.titleRow}>
              <Text style={[styles.routeName, { color: colors.text }]} numberOfLines={1}>{route.name}</Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push(Routes.routeAddOrders(route.id))}
                accessibilityRole="button"
                accessibilityLabel={t('addOrdersToRoute')}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <MaterialIcons name="add" size={22} color={colors.textInverse} />
              </TouchableOpacity>
            </View>
            <RouteDriverSection />
            <View style={styles.stopsHeader}>
              <Text style={[styles.stopsTitle, { color: colors.text }]}>{t("plannedStops")}</Text>
              <View style={[styles.stopsCount, { backgroundColor: colors.success + '20' }]}>
                <Text style={[styles.stopsCountText, { color: colors.success }]}>{route.points.length} {t("stopsTotal")}</Text>
              </View>
            </View>
          </>
        }
      />
    </RouteMapSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sheetContent: {
    paddingHorizontal: Spacing.lg,
    // paddingBottom (clears the sticky swipe-button footer) is set inline.
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 48,
    marginBottom: Spacing.sm,
  },
  routeName: {
    flex: 1,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    textAlign: 'center',
  },
  stopsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  stopsTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  stopsCount: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.sm,
  },
  stopsCountText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  stopNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  stopNumberText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  stopContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  stopName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 2,
  },
  stopAddress: {
    fontSize: Typography.fontSize.sm,
  },
  stopTime: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 2,
  },
  timeLabel: {
    fontSize: Typography.fontSize.xs,
  },
  navigationButton: {
    marginBottom: 0,
  },
});
