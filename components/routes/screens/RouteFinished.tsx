import { PrimaryButton, TopBar } from '@/components';
import Map from '@/components/maps/Map';
import { BorderRadius, Routes, Spacing, Typography } from '@/constants';
import { useRoute } from '@/context/RouteContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RouteFinishedScreen() {
  const { t } = useTranslation();
  const { route, isLoading, error } = useRoute();
  const colors = useThemeColor();

  // Calculate route statistics
  const totalDistance = React.useMemo(() => {
    if (!route) return '0';
    // Mock calculation - replace with actual distance calculation
    return '24.8';
  }, [route]);

  const totalTime = React.useMemo(() => {
    if (!route) return '0h 0m';
    const firstPoint = route.points[0];
    const lastPoint = route.points[route.points.length - 1];
    const minutes = moment(lastPoint.updatedAt).diff(moment(firstPoint.updatedAt), 'minutes');
    return Math.floor(minutes / 60) + 'h ' + (minutes % 60) + 'm';
  }, [route]);

  const completedDeliveries = React.useMemo(() => {
    if (!route) return { completed: 0, total: 0 };
    const completed = route.points.filter(point => point.status === 'VISITED').length;
    return { completed, total: route.points.length };
  }, [route]);


  const handleFinishRoute = () => {
    // Navigate back to routes list
    router.push(Routes.routes);
  };


  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <TopBar title={t('routeFinished')} showBack backTo={Routes.routes} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('loadingRouteSummary')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !route) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <TopBar title={t('routeFinished')} showBack backTo={Routes.routes} />
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: colors.danger }]}>{error || t('routeNotFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title={t('routeSummary')} showBack backTo={Routes.routes} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIconContainer}>
            <View style={[styles.successIconCircle, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="checkmark" size={40} color={colors.success} />
            </View>
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>{t('routeFinishedExclamation')}</Text>
          <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>{t('allDeliveriesCompletedSuccessfully')}</Text>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('distance')}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalDistance}<Text style={[styles.statUnit, { color: colors.textSecondary }]}>{t('mi')}</Text></Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('totalTime')}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalTime}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('deliveries')}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {completedDeliveries.completed}<Text style={[styles.statUnit, { color: colors.textSecondary }]}>/{completedDeliveries.total}</Text>
            </Text>
          </View>
        </View>

        {/* Route Map */}
        <View style={styles.mapContainer}>
          <Map
            markers={route.points.map((point, index) => ({
              coordinate: {
                latitude: point.order.client.location.lat || 37.7749,
                longitude: point.order.client.location.lng || -122.4194,
              },
              title: point.order.client.name,
              description: point.status === 'VISITED' ? 'Completed' : 'Pending',
              backgroundColor: point.status === 'VISITED' ? colors.success : colors.primary,
            }))}
            polylines={route.polyline}
          />
        </View>

        {/* Completed Stops Section */}
        <View style={styles.completedStopsSection}>
          <View style={styles.completedStopsHeader}>
            <Text style={[styles.completedStopsTitle, { color: colors.text }]}>{t('completedStops')}</Text>
            <Text style={[styles.completedStopsCount, { color: colors.textSecondary }]}>
              {completedDeliveries.completed} {t('total')}
            </Text>
          </View>

          <View style={styles.completedStopsList}>
            {route.points
              .filter(point => point.status === 'VISITED')
              .map((point, index) => (
                <View key={point.id} style={[styles.completedStopItem, { backgroundColor: colors.backgroundSecondary }]}>
                  <View style={[styles.completedStopCheck, { backgroundColor: colors.success + '20' }]}>
                    <Ionicons name="checkmark" size={16} color={colors.success} />
                  </View>

                  <View style={styles.completedStopContent}>
                    <Text style={[styles.completedStopName, { color: colors.text }]}>{point.order.client.name}</Text>
                    <Text style={[styles.completedStopAddress, { color: colors.textSecondary }]}>
                      {point.order.client.location.lat || "123 Business Way, Suite 400"}
                    </Text>
                  </View>

                  <Text style={[styles.completedStopTime, { color: colors.textSecondary }]}>{moment(point.updatedAt).format('h:mm A')}</Text>
                </View>
              ))}
          </View>
        </View>

        {/* Finish Button */}
        <View style={styles.finishButtonContainer}>
          <PrimaryButton
            title={t('backToRoutes')}
            onPress={handleFinishRoute}
          />
        </View>
      </ScrollView>
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
  successHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  successIconContainer: {
    marginBottom: Spacing.lg,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  successSubtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  statUnit: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
  },
  mapContainer: {
    height: 200,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  completedStopsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  completedStopsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  completedStopsTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  completedStopsCount: {
    fontSize: Typography.fontSize.sm,
  },
  completedStopsList: {
    gap: Spacing.xs,
  },
  completedStopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  completedStopCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  completedStopContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  completedStopName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 2,
  },
  completedStopAddress: {
    fontSize: Typography.fontSize.sm,
  },
  completedStopTime: {
    fontSize: Typography.fontSize.sm,
  },
  finishButtonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
});
