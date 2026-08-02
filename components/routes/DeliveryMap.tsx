import Map from "@/components/maps/Map";
import { BorderRadius, Spacing } from "@/constants";
import { useThemeColor } from "@/hooks/useColorScheme";
import React from "react";
import { StyleSheet, View } from "react-native";

type DeliveryMapProps = {
  completedDeliveries: RoutePoint[];
  pendingDeliveries: RoutePoint[];
  skippedDeliveries: RoutePoint[];
  userLocation?: {
    latitude: number;
    longitude: number;
  };

  polylines?: string;
  /** Encuadra la cámara sobre la ruta completa en lugar de centrarla en el usuario. */
  fitToRoute?: boolean;
};

const DeliveryMap: React.FC<DeliveryMapProps> = ({
  userLocation,
  polylines,
  completedDeliveries,
  pendingDeliveries,
  skippedDeliveries,
  fitToRoute,
}) => {
  const colors = useThemeColor();
  const completedMarkers = completedDeliveries.map((delivery) => ({
    coordinate: {
      latitude: delivery.order.client.location.lat || 37.7749,
      longitude: delivery.order.client.location.lng || -122.4194,
    },
    title: delivery.order.client.name.substring(0, 1).toUpperCase(),
    description: "Completed delivery",
    backgroundColor: "#00ff08ff",
  }));

  const pendingMarkers = pendingDeliveries.map((delivery) => ({
    coordinate: {
      latitude: delivery.order.client.location.lat || 37.7749,
      longitude: delivery.order.client.location.lng || -122.4194,
    },
    title: delivery.order.client.name.substring(0, 1).toUpperCase(),
    description: "Pending delivery",
    backgroundColor: "#ffcc00ff",
  }));

  const skippedMarkers = skippedDeliveries.map((delivery) => ({
    coordinate: {
      latitude: delivery.order.client.location.lat || 37.7749,
      longitude: delivery.order.client.location.lng || -122.4194,
    },
    title: delivery.order.client.name.substring(0, 1).toUpperCase(),
    description: "Skipped delivery",
    backgroundColor: "#ff0000ff",
  }));

  return (
    <View
      style={[
        styles.mapContainer,
        { backgroundColor: colors.backgroundSecondary },
      ]}
    >
      <Map
        markers={[
          ...completedMarkers,
          ...pendingMarkers,
          ...skippedMarkers,
          ...(userLocation
            ? [
                {
                  coordinate: {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  },
                  title: "Your Location",
                  description: "Current position",
                  backgroundColor: "#0000ff88",
                  excludeFromFit: true,
                },
              ]
            : []),
        ]}
        polylines={polylines}
        fitToMarkers={fitToRoute}
      />

      {/* Distance indicator overlay */}
      <View
        style={[styles.distanceOverlay, { backgroundColor: colors.background }]}
      >
        {/* <Text style={styles.distanceText}>2.4 mi away</Text> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    height: 300,
    position: "relative",
  },
  distanceOverlay: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    shadowColor: "#000",
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
    fontWeight: "600",
  },
});

export default DeliveryMap;
