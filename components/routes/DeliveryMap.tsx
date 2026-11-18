import Map from "@/components/maps/Map";
import { ROUTE_BACK_BUTTON_SIZE } from "@/components/routes/RouteMapSheet";
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
  /** Status-bar height when the map is full-screen; overlays are pushed below it. */
  topInset?: number;
  /** Space covered by a bottom sheet, kept clear when framing the route. */
  bottomInset?: number;
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
  topInset = 0,
  bottomInset = 0,
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
        fitInsets={{ top: topInset, bottom: bottomInset }}
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
        <View style={[styles.staleBadge, { backgroundColor: colors.background, top: Spacing.sm + topInset + (ROUTE_BACK_BUTTON_SIZE - 28) / 2 }]}>
          <Text style={[styles.staleText, { color: colors.textSecondary }]}>
            {t("lastUpdatedMinutesAgo", { count: minutesAgo })}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Fills its parent (the route screens render it full-screen behind a sheet).
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  staleBadge: {
    position: "absolute",
    top: Spacing.md,
    // Clears the floating back button (RouteMapSheet, top-left).
    left: Spacing.lg + ROUTE_BACK_BUTTON_SIZE + Spacing.sm,
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
