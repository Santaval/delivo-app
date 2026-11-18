import Map from "@/components/maps/Map";
import { BorderRadius, Spacing } from "@/constants";
import { useThemeColor } from "@/hooks/useColorScheme";
import { staleMinutes } from "@/utils/driverLocation";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

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
  /** Live position of the driver (OWNER/ADMIN watching a STARTED route). */
  driverLocation?: RouteDriverLocation | null;
  driverName?: string | null;
};

const DeliveryMap: React.FC<DeliveryMapProps> = ({
  userLocation,
  polylines,
  completedDeliveries,
  pendingDeliveries,
  skippedDeliveries,
  fitToRoute,
  driverLocation,
  driverName,
}) => {
  const colors = useThemeColor();
  const { t } = useTranslation();

  // Re-evaluated every 30 s so "last updated" appears without a new position
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!driverLocation) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [driverLocation]);
  const minutesAgo = driverLocation ? staleMinutes(driverLocation.recordedAt, now) : null;

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
        driver={
          driverLocation
            ? {
                coordinate: { latitude: driverLocation.lat, longitude: driverLocation.lng },
                heading: driverLocation.heading,
                name: driverName,
              }
            : null
        }
      />

      {minutesAgo !== null && (
        <View style={[styles.staleBadge, { backgroundColor: colors.background }]}>
          <Text style={[styles.staleText, { color: colors.textSecondary }]}>
            {t("lastUpdatedMinutesAgo", { count: minutesAgo })}
          </Text>
        </View>
      )}

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
  staleBadge: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    elevation: 5,
  },
  staleText: {
    fontSize: 12,
    fontWeight: "600",
  },
  distanceText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default DeliveryMap;
