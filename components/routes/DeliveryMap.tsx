import Map from '@/components/maps/Map';
import { BorderRadius, Colors, Spacing } from '@/constants';
import React from 'react';
import { StyleSheet, View } from 'react-native';

type DeliveryMapProps = {
  completedDeliveries: RoutePoint[];
  pendingDeliveries: RoutePoint[];
  skippedDeliveries: RoutePoint[];
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  
  polylines?: string;
};




const DeliveryMap: React.FC<DeliveryMapProps> = ({
  userLocation,
  polylines,
  completedDeliveries,
  pendingDeliveries,
  skippedDeliveries
}) => {
  const completedMarkers = completedDeliveries.map(delivery => ({
  coordinate: {
    latitude: delivery.order.client.location.lat || 37.7749,
    longitude: delivery.order.client.location.lng || -122.4194,
  },
  title: delivery.order.client.name,
  description: 'Completed delivery',
  backgroundColor: '#00ff08ff',
}));

const pendingMarkers = pendingDeliveries.map(delivery => ({
  coordinate: {
    latitude: delivery.order.client.location.lat || 37.7749,
    longitude: delivery.order.client.location.lng || -122.4194,
  },
  title: delivery.order.client.name,
  description: 'Pending delivery',
  backgroundColor: '#ffcc00ff',
}));

const skippedMarkers = skippedDeliveries.map(delivery => ({
  coordinate: {
    latitude: delivery.order.client.location.lat || 37.7749,
    longitude: delivery.order.client.location.lng || -122.4194,
  },
  title: delivery.order.client.name,
  description: 'Skipped delivery',
  backgroundColor: '#ff0000ff',
}));

  return (
    <View style={styles.mapContainer}>
      <Map 
        markers={[
          ...completedMarkers,
          ...pendingMarkers,
          ...skippedMarkers,
          ...(userLocation ? [{
            coordinate: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            },
            title: 'Your Location',
            description: 'Current position',
            backgroundColor: '#0000ff88',
          }] : [])
        ]}
        polylines={polylines}
      />
      
      {/* Distance indicator overlay */}
      <View style={styles.distanceOverlay}>
        {/* <Text style={styles.distanceText}>2.4 mi away</Text> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
});

export default DeliveryMap;
