import { TopBar } from '@/components';
import { OrderCard } from '@/components/OrderCard';
import AllStopsList from '@/components/routes/AllStopsList';
import CompleteDeliveryButton from '@/components/routes/CompleteDeliveryButton';
import CurrentStopHeader from '@/components/routes/CurrentStopHeader';
import DeliveryActionButtons from '@/components/routes/DeliveryActionButtons';
import DeliveryMap from '@/components/routes/DeliveryMap';
import DeliveryTabs, { Tab } from '@/components/routes/DeliveryTabs';
import { BorderRadius, Routes, Spacing, Typography } from '@/constants';
import { useRoute } from '@/context/RouteContext';
import { useToast } from '@/context/ToastContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import useUserLocation from '@/hooks/useUserLocation';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RouteDeliveryScreen() {
  const { route, isLoading, error, getCurrentPoint, completeCurrentDelivery } = useRoute();
  const { location, refreshLocation } = useUserLocation();
  const { t } = useTranslation();
  const toast = useToast();
  const colors = useThemeColor();

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
        <TopBar title={t('delivery')} showBack backTo={Routes.tabRoutes} />
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
        <TopBar title={t('delivery')} showBack backTo={Routes.tabRoutes} />
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: colors.danger }]}>{error || t('noActiveDeliveryFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentClient = currentPoint.order.client;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title={t('currentDelivery')} showBack backTo={Routes.tabRoutes} />

      <View style={styles.content}>
        {/* Map Section */}
        <DeliveryMap
          completedDeliveries={route.points.filter(point => point.status === 'VISITED')}
          pendingDeliveries={route.points.filter(point => point.status === 'CREATED')}
          skippedDeliveries={route.points.filter(point => point.status === 'SKIPPED')}
          userLocation={location?.coords}
          polylines={route.polyline}
          fitToRoute
        />

        {/* Client Info Section */}
        <View style={[styles.clientInfoContainer, { backgroundColor: colors.background }]}>
          {/* Tabs */}
          <DeliveryTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Current Location Tab */}
          {activeTab === 'current' && (
            <>
              {/* Current Stop Header */}
              <CurrentStopHeader clientName={currentClient.name} />

              {/* Action Buttons */}
              <DeliveryActionButtons
                onCall={handleCallClient}
                onOpenGPS={handleOpenGPS}
              />

              {/* Delivery Notes */}
              <OrderCard
                order={currentPoint.order}
                onPress={() => {router.push(Routes.orderView(currentPoint.order.id))}}
              />

              {/* Complete Delivery Button */}
              <CompleteDeliveryButton
                onSwipeComplete={handleCompleteDelivery}
                isLoading={isCompletingDelivery}
              />
            </>
          )}

          {/* All Stops Tab */}
          {activeTab === 'all' && (
            <AllStopsList
              stops={route.points}
              currentStopId={currentPoint.id}
            />
          )}
        </View>
      </View>
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
  clientInfoContainer: {
    flex: 1,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    marginTop: -BorderRadius.xl,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
});
