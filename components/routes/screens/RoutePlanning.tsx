import { FloatingActionButton, SwipeButton, TopBar } from '@/components';
import Map from '@/components/maps/Map';
import { BorderRadius, Routes, Spacing, Typography } from '@/constants';
import { useRoute } from '@/context/RouteContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RoutePlanningScreen() {

  const { route, isLoading, error, startNavigation } = useRoute();
  const { t } = useTranslation();
  const colors = useThemeColor();






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
        <TopBar title={t('routeMap')} showBack backTo={Routes.tabRoutes} />
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
        <TopBar title={t('routeMap')} showBack backTo={Routes.tabRoutes} />
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: colors.danger }]}>{error || t('routeNotFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title={route.name} showBack backTo={Routes.tabRoutes} />

      <View style={styles.content}>
        {/* Map Section */}
        <View style={[styles.mapContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <Map
            markers={route.points.map((point, index) => ({
              coordinate: {
                latitude: point.order.client.location.lat || 37.7749,
                longitude: point.order.client.location.lng || -122.4194,
              },
              title: point.order.client.name,
              description: 'Delivery stop',
              backgroundColor: colors.primary,
            }))}
            polylines={route.polyline}
          />
        </View>

        {/* Planned Stops Section */}
        <View style={[styles.stopsContainer, { backgroundColor: colors.background }]}>
          <View style={styles.stopsHeader}>
            <Text style={[styles.stopsTitle, { color: colors.text }]}>{t("plannedStops")}</Text>
            <View style={[styles.stopsCount, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.stopsCountText, { color: colors.success }]}>{route.points.length} {t("stopsTotal")}</Text>
            </View>
          </View>

          <FlatList
            data={route.points}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={renderStopItem}
            showsVerticalScrollIndicator={false}
            style={styles.stopsList}
          />

          <View style={[styles.navigationButtonContainer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
            <SwipeButton
              onSwipeComplete={startNavigation}
              text={isLoading ? t("optimizingRoute") : t("slideToStartNavigation")}
              isLoading={isLoading}
              iconName="navigate"
              backgroundColor={colors.success}
              style={styles.navigationButton}
            />
          </View>
        </View>
      </View>
      <FloatingActionButton
        icon="add"
        onPress={() => router.push(Routes.routeAddOrders(route.id))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: 250,
  },
  map: {
    flex: 1,
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
  stopsContainer: {
    flex: 1,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    marginTop: -BorderRadius.xl,
    paddingTop: Spacing.lg,
  },
  stopsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
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
  stopsList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
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
  navigationButtonContainer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  navigationButton: {
    marginBottom: 0,
  },
});
