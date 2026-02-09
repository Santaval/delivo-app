import { FloatingActionButton, PrimaryButton, TopBar } from '@/components';
import Map from '@/components/maps/Map';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants';
import useRoute from '@/hooks/useRoute';
import { router, useLocalSearchParams } from 'expo-router';
import moment from 'moment';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RouteView() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { route, loading, error } = useRoute(id);

  const formatEstimatedArrival = (index: number) => {
    // Calculate estimated arrival based on start time + travel time
    const startTime = moment().hour(9).minute(30); // 09:30 AM start
    const travelTimePerStop = 30; // 30 minutes per stop
    const arrivalTime = startTime.clone().add(index * travelTimePerStop, 'minutes');
    
    return arrivalTime.format('hh:mm A');
  };

  const handleStartNavigation = () => {
    // TODO: Implement navigation start logic
    console.log('Starting navigation for route:', route?.name);
  };

  const renderStopItem = ({ item, index }: { item: RoutePoint; index: number }) => (
    <View style={styles.stopItem}>
      <View style={styles.stopNumber}>
        <Text style={styles.stopNumberText}>{index + 1}</Text>
      </View>
      
      <View style={styles.stopContent}>
        <Text style={styles.stopName}>{item.order.client.name}</Text>
        <Text style={styles.stopAddress}>
          {/* Mock address - replace with actual client address */}
         {item.order.items.map((i) => i.name).join(", ")}
        </Text>
      </View>
      
      {/* <View style={styles.stopTime}>
        <Text style={styles.timeText}>{formatEstimatedArrival(index)}</Text>
        <Text style={styles.timeLabel}>Arrival Est.</Text>
      </View> */}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar title="Route Map" />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading route...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !route) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar title="Route Map" />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error || 'Route not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title={route.name} />
      
      <View style={styles.content}>
        {/* Map Section */}
        <View style={styles.mapContainer}>
          <Map 
            markers={route.points.map((point, index) => ({
              coordinate: {
                latitude: point.order.client.location.lat || 37.7749,
                longitude: point.order.client.location.lng || -122.4194,
              },
              title: `${index + 1}. ${point.order.client.name}`,
              description: 'Delivery stop',
            }))}
            polylines={route.polyline}
          />
        </View>

        {/* Planned Stops Section */}
        <View style={styles.stopsContainer}>
          <View style={styles.stopsHeader}>
            <Text style={styles.stopsTitle}>Planned Stops</Text>
            <View style={styles.stopsCount}>
              <Text style={styles.stopsCountText}>{route.points.length} Stops Total</Text>
            </View>
          </View>
          
          <FlatList
            data={route.points}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={renderStopItem}
            showsVerticalScrollIndicator={false}
            style={styles.stopsList}
          />
          
          <View style={styles.navigationButtonContainer}>
            <PrimaryButton
              title="Start Navigation"
              onPress={handleStartNavigation}
              style={styles.navigationButton}
            />
          </View>
        </View>
      </View>
      <FloatingActionButton 
        icon="add"
        onPress={() => router.push(`/routes/view/addOrders?routeId=${route.id}`)}
      />
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
    height: 250,
    backgroundColor: Colors.light.backgroundSecondary,
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
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.light.danger,
    textAlign: 'center',
  },
  stopsContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
    color: Colors.light.text,
  },
  stopsCount: {
    backgroundColor: Colors.light.success + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.sm,
  },
  stopsCountText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.success,
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
    borderBottomColor: Colors.light.border,
  },
  stopNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  stopNumberText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.textInverse,
  },
  stopContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  stopName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: 2,
  },
  stopAddress: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  stopTime: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.primary,
    marginBottom: 2,
  },
  timeLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },
  navigationButtonContainer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  navigationButton: {
    marginBottom: 0,
  },
});