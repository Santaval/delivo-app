import { SwipeButton, TopBar } from '@/components';
import Map from '@/components/maps/Map';
import { OrderCard } from '@/components/OrderCard';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants';
import { useRoute } from '@/context/RouteContext';
import useUserLocation from '@/hooks/useUserLocation';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RouteDeliveryScreen() {
  const { route, isLoading, error, getCurrentPoint, completeCurrentDelivery } = useRoute();
  const { location } = useUserLocation();
  
  const [isCompletingDelivery, setIsCompletingDelivery] = React.useState(false);

  const currentPoint = getCurrentPoint();

  const handleCompleteDelivery = async () => {
    if (!currentPoint) return;
    
    setIsCompletingDelivery(true);
    try {
       await completeCurrentDelivery();

    } catch (error) {
      console.error('Failed to complete delivery:', error);
      Alert.alert('Error', 'Failed to complete delivery. Please try again.');
    } finally {
      setIsCompletingDelivery(false);
    }
  };

  const handleCallClient = () => {
    if (currentPoint?.order.client.phoneNumber) {
      Linking.openURL(`tel:${currentPoint.order.client.phoneNumber}`);
    } else {
      Alert.alert('No Phone Number', 'No phone number available for this client.');
    }
  };

  const handleOpenGPS = () => {
    if (currentPoint?.order.client.location) {
      const { lat, lng } = currentPoint.order.client.location;
      // open waze
      Linking.openURL(`waze://?ll=${lat},${lng}`);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar title="Delivery" />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading delivery...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !route || !currentPoint) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar title="Delivery" />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error || 'No active delivery found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentClient = currentPoint.order.client;

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title="Current Delivery" />
      
      <View style={styles.content}>
        {/* Map Section */}
        <View style={styles.mapContainer}>
          <Map 
            markers={[
              {
                coordinate: {
                  latitude: currentClient.location.lat || 37.7749,
                  longitude: currentClient.location.lng || -122.4194,
                },
                title: currentClient.name,
                description: 'Current delivery location',
              },
              ...(location ? [{
                coordinate: {
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                },
                title: 'Your Location',
                description: 'Current position',
              }] : [])
            ]}

            polylines={route.polyline}
          />
          
          {/* Distance indicator overlay */}
          <View style={styles.distanceOverlay}>
            {/* <Text style={styles.distanceText}>2.4 mi away</Text> */}
          </View>
        </View>

        {/* Client Info Section */}
        <View style={styles.clientInfoContainer}>
          {/* Current Stop Header */}
          <View style={styles.currentStopHeader}>
            <View style={styles.stopIndicator}>
              <Ionicons name="location" size={16} color={Colors.light.primary} />
            </View>
            <Text style={styles.currentStopLabel}>CURRENT STOP</Text>
          </View>

          {/* Client Details */}
          <View style={styles.clientDetails}>
            <Text style={styles.clientName}>{currentClient.name}</Text>
            {/* <Text style={styles.clientAddress}>
              {"123 Business Way, Suite 400"}
            </Text> */}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleCallClient}
            >
              <Ionicons name="call" size={20} color={Colors.light.primary} />
              <Text style={styles.actionButtonText}>Call Client</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryActionButton]}
              onPress={handleOpenGPS}
            >
              <Ionicons name="navigate" size={20} color={Colors.light.textInverse} />
              <Text style={[styles.actionButtonText, styles.primaryActionButtonText]}>Open GPS</Text>
            </TouchableOpacity>
          </View>

          {/* Delivery Notes */}
          {/* <View style={styles.deliveryNotes}> */}
            <OrderCard
              order={currentPoint.order}
              onPress={() => {router.push(`/orders/view/${currentPoint.order.id}`)}}
            />
          {/* </View> */}


          {/* Complete Delivery Button */}
          <View style={styles.completeDeliveryContainer}>
            <SwipeButton
              onSwipeComplete={handleCompleteDelivery}
              text={isCompletingDelivery ? 'Completing Delivery...' : 'Slide to Complete Delivery'}
              isLoading={isCompletingDelivery}
              iconName="checkmark"
              backgroundColor={Colors.light.success}
              style={styles.completeDeliveryButton}
            />
          </View>
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
  mapContainer: {
    height: 300,
    backgroundColor: Colors.light.backgroundSecondary,
    position: 'relative',
  },
  distanceOverlay: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  distanceText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.primary,
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
  currentStopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stopIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  currentStopLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.primary,
    letterSpacing: 1,
  },
  clientDetails: {
    marginBottom: Spacing.md,
  },
  clientName: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  clientAddress: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  primaryActionButton: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.primary,
    marginLeft: Spacing.xs,
  },
  primaryActionButtonText: {
    color: Colors.light.textInverse,
  },
  deliveryNotes: {
    backgroundColor: Colors.light.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  notesLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.textSecondary,
    marginLeft: Spacing.xs,
  },
  notesText: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  nextStopPreview: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  nextStopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  nextStopLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  nextStopDistance: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },
  nextStopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextStopAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  nextStopDetails: {
    flex: 1,
  },
  nextStopName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: 2,
  },
  nextStopAddress: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  completeDeliveryContainer: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  completeDeliveryButton: {
    marginBottom: 0,
  },
});
