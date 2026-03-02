import { PrimaryButton, TopBar } from '@/components';
import Map from '@/components/maps/Map';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants';
import { useRoute } from '@/context/RouteContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import moment from 'moment';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RouteFinishedScreen() {
  const { route, isLoading, error } = useRoute();

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
    router.push('/(tabs)/routes');
  };


  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar title="Route Finished" />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading route summary...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !route) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar title="Route Finished" />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error || 'Route not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title="Route Summary" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIconContainer}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={40} color={Colors.light.success} />
            </View>
          </View>
          <Text style={styles.successTitle}>Route Finished!</Text>
          <Text style={styles.successSubtitle}>All deliveries completed successfully</Text>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>DISTANCE</Text>
            <Text style={styles.statValue}>{totalDistance}<Text style={styles.statUnit}>mi</Text></Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TOTAL TIME</Text>
            <Text style={styles.statValue}>{totalTime}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>DELIVERIES</Text>
            <Text style={styles.statValue}>
              {completedDeliveries.completed}<Text style={styles.statUnit}>/{completedDeliveries.total}</Text>
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
              backgroundColor: point.status === 'VISITED' ? Colors.light.success : Colors.light.primary,
            }))}
            polylines={route.polyline}
          />
        </View>

        {/* Completed Stops Section */}
        <View style={styles.completedStopsSection}>
          <View style={styles.completedStopsHeader}>
            <Text style={styles.completedStopsTitle}>COMPLETED STOPS</Text>
            <Text style={styles.completedStopsCount}>
              {completedDeliveries.completed} Total
            </Text>
          </View>
          
          <View style={styles.completedStopsList}>
            {route.points
              .filter(point => point.status === 'VISITED')
              .map((point, index) => (
                <View key={point.id} style={styles.completedStopItem}>
                  <View style={styles.completedStopCheck}>
                    <Ionicons name="checkmark" size={16} color={Colors.light.success} />
                  </View>
                  
                  <View style={styles.completedStopContent}>
                    <Text style={styles.completedStopName}>{point.order.client.name}</Text>
                    <Text style={styles.completedStopAddress}>
                      {point.order.client.location.lat || "123 Business Way, Suite 400"}
                    </Text>
                  </View>

                  <Text style={styles.completedStopTime}>{moment(point.updatedAt).format('h:mm A')}</Text>
                </View>
              ))}
          </View>
        </View>

        {/* Finish Button */}
        <View style={styles.finishButtonContainer}>
          <PrimaryButton
            title="Back to Routes"
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
    backgroundColor: Colors.light.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  successSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
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
    backgroundColor: Colors.light.backgroundSecondary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  statUnit: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.light.textSecondary,
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
    color: Colors.light.text,
    letterSpacing: 0.5,
  },
  completedStopsCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  completedStopsList: {
    gap: Spacing.xs,
  },
  completedStopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  completedStopCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.success + '20',
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
    color: Colors.light.text,
    marginBottom: 2,
  },
  completedStopAddress: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  completedStopTime: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  finishButtonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
});
