import React from 'react';
import { StyleSheet, View } from 'react-native';
import Map from '@/components/maps/Map';
import { BorderRadius, Colors, Spacing } from '@/constants';

type DeliveryMapProps = {
  clientLocation: {
    lat: number | null;
    lng: number | null;
  };
  clientName: string;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  polylines?: string;
};

const DeliveryMap: React.FC<DeliveryMapProps> = ({
  clientLocation,
  clientName,
  userLocation,
  polylines,
}) => {
  return (
    <View style={styles.mapContainer}>
      <Map 
        markers={[
          {
            coordinate: {
              latitude: clientLocation.lat || 37.7749,
              longitude: clientLocation.lng || -122.4194,
            },
            title: clientName,
            description: 'Current delivery location',
          },
          ...(userLocation ? [{
            coordinate: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            },
            title: 'Your Location',
            description: 'Current position',
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
