import { TopBar } from '@/components';
import { OrderCard } from '@/components/OrderCard';
import AllStopsList from '@/components/routes/AllStopsList';
import CompleteDeliveryButton from '@/components/routes/CompleteDeliveryButton';
import CurrentStopHeader from '@/components/routes/CurrentStopHeader';
import DeliveryActionButtons from '@/components/routes/DeliveryActionButtons';
import DeliveryMap from '@/components/routes/DeliveryMap';
import DeliveryTabs, { Tab } from '@/components/routes/DeliveryTabs';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants';
import { useRoute } from '@/context/RouteContext';
import useUserLocation from '@/hooks/useUserLocation';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RouteDeliveryScreen() {
  const { route, isLoading, error, getCurrentPoint, completeCurrentDelivery } = useRoute();
  const { location, refreshLocation } = useUserLocation();
  const { t } = useTranslation(); 
  
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
      Alert.alert(t('error'), t('failedToCompleteDelivery'));
    } finally {
      setIsCompletingDelivery(false);
    }
  };

  const handleCallClient = () => {
    if (currentPoint?.order.client.phoneNumber) {
      Linking.openURL(`tel:${currentPoint.order.client.phoneNumber}`);
    } else {
      Alert.alert(t('error'), t('noPhoneNumber'));
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
      <SafeAreaView style={styles.container}>
        <TopBar title={t('delivery')} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>{t("loadingDelivery")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !route || !currentPoint) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar title={t('delivery')} />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error || t('noActiveDeliveryFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentClient = currentPoint.order.client;

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title={t('currentDelivery')} />
      
      <View style={styles.content}>
        {/* Map Section */}
        <DeliveryMap
          completedDeliveries={route.points.filter(point => point.status === 'VISITED')}
          pendingDeliveries={route.points.filter(point => point.status === 'CREATED')}
          skippedDeliveries={route.points.filter(point => point.status === 'SKIPPED')}
          userLocation={location?.coords}
          polylines={route.polyline}
        />

        {/* Client Info Section */}
        <View style={styles.clientInfoContainer}>
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
                onPress={() => {router.push(`/orders/view/${currentPoint.order.id}`)}}
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
    backgroundColor: Colors.light.background,
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
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.light.danger,
    textAlign: 'center',
  },
  clientInfoContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    marginTop: -BorderRadius.xl,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
});
