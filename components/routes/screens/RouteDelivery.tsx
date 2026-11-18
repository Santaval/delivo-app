import { TopBar } from '@/components';
import { OrderCard } from '@/components/OrderCard';
import AllStopsList from '@/components/routes/AllStopsList';
import CompleteDeliveryButton from '@/components/routes/CompleteDeliveryButton';
import CurrentStopHeader from '@/components/routes/CurrentStopHeader';
import DeliveryActionButtons from '@/components/routes/DeliveryActionButtons';
import DeliveryMap from '@/components/routes/DeliveryMap';
import RouteDriverBadge from '@/components/routes/RouteDriverBadge';
import { ROUTE_SHEET_FOOTER_HEIGHT, RouteMapSheet, useRouteSheetCoverage } from '@/components/routes/RouteMapSheet';
import TrackingIndicator from '@/components/routes/TrackingIndicator';
import DeliveryTabs, { Tab } from '@/components/routes/DeliveryTabs';
import { Routes, Spacing, Typography } from '@/constants';
import { useRoute } from '@/context/RouteContext';
import { useToast } from '@/context/ToastContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import useCompanyMembers from '@/hooks/useCompanyMembers';
import useDriverLiveLocation from '@/hooks/useDriverLiveLocation';
import useUserLocation from '@/hooks/useUserLocation';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RouteDeliveryScreen() {
  const { route, isLoading, error, getCurrentPoint, completeCurrentDelivery } = useRoute();
  const { location, refreshLocation } = useUserLocation();
  const { t } = useTranslation();
  const toast = useToast();
  const colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const sheetCoverage = useRouteSheetCoverage();
  const { canManageRoutes, userId } = useCompanyMembers();

  // Only OWNER/ADMIN watch the driver, and only while the route is STARTED. A driver
  // keeps seeing their own map (their own position is the blue dot).
  const watchDriver =
    canManageRoutes && route?.status === 'STARTED' && !!route.driverId && route.driverId !== userId;
  const { location: driverLocation } = useDriverLiveLocation(route?.id, {
    enabled: watchDriver,
    initial: route?.driverLocation ?? null,
  });

  const [isCompletingDelivery, setIsCompletingDelivery] = React.useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('current');

  const currentPoint = getCurrentPoint();

  const handleCompleteDelivery = async () => {
    if (!currentPoint) return;

    setIsCompletingDelivery(true);
    try {
       await completeCurrentDelivery();

    } catch (error) {
      console.error('Failed to complete delivery:', error);
      toast.show({ message: t('failedToCompleteDelivery'), type: 'error' });
    } finally {
      setIsCompletingDelivery(false);
    }
  };

  const handleCallClient = () => {
    if (currentPoint?.order.client.phoneNumber) {
      Linking.openURL(`tel:${currentPoint.order.client.phoneNumber}`);
    } else {
      toast.show({ message: t('noPhoneNumber'), type: 'error' });
    }
  };

  const handleOpenGPS = () => {
    if (currentPoint?.order.client.location) {
      const { lat, lng } = currentPoint.order.client.location;
      // open waze
      Linking.openURL(`waze://?ll=${lat},${lng}`);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refreshLocation();
    }, 5000); // each 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <TopBar title={t('delivery')} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t("loadingDelivery")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !route || !currentPoint) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <TopBar title={t('delivery')} />
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: colors.danger }]}>{error || t('noActiveDeliveryFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentClient = currentPoint.order.client;

  return (
    <RouteMapSheet
      map={
        <DeliveryMap
          completedDeliveries={route.points.filter(point => point.status === 'VISITED')}
          pendingDeliveries={route.points.filter(point => point.status === 'CREATED')}
          skippedDeliveries={route.points.filter(point => point.status === 'SKIPPED')}
          userLocation={location?.coords}
          polylines={route.polyline}
          fitToRoute
          driverLocation={watchDriver ? driverLocation : null}
          driverName={route.driver ? `${route.driver.name} ${route.driver.surnames}` : null}
          topInset={insets.top}
          bottomInset={sheetCoverage}
        />
      }
      topRight={<RouteDriverBadge />}
      // The complete-delivery swipe stays pinned while on the current stop
      footer={
        activeTab === 'current' ? (
          <CompleteDeliveryButton
            onSwipeComplete={handleCompleteDelivery}
            isLoading={isCompletingDelivery}
          />
        ) : undefined
      }
    >
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.sheetContent,
          {
            // Clear the sticky complete-delivery footer (current tab) and the home indicator.
            paddingBottom:
              (activeTab === 'current' ? ROUTE_SHEET_FOOTER_HEIGHT : 0) + Spacing.lg + insets.bottom,
          },
        ]}
      >
        {/* Current stop first, so it's visible even when the sheet is collapsed */}
        <CurrentStopHeader clientName={currentClient.name} />
        <TrackingIndicator />
        <DeliveryTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'current' && (
          <>
            <DeliveryActionButtons
              onCall={handleCallClient}
              onOpenGPS={handleOpenGPS}
            />
            <OrderCard
              order={currentPoint.order}
              onPress={() => {router.push(Routes.orderView(currentPoint.order.id))}}
            />
          </>
        )}

        {activeTab === 'all' && (
          <AllStopsList
            stops={route.points}
            currentStopId={currentPoint.id}
          />
        )}
      </BottomSheetScrollView>
    </RouteMapSheet>
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
  sheetContent: {
    paddingHorizontal: Spacing.lg,
  },
});
