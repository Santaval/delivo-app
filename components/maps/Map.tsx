import useUserLocation from "@/hooks/useUserLocation";
import polyline from "@mapbox/polyline";
import MapboxGL from "@rnmapbox/maps";
import { Component, ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CustomMarker } from "./CustomMarker";

type MarkerProps = {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  description: string;
  backgroundColor: string;
};

type Props = {
  markers?: MarkerProps[];
  polylines?: string;
};

class MapErrorBoundary extends Component<{ children: ReactNode }, { crashed: boolean }> {
  state = { crashed: false };

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  render() {
    if (this.state.crashed) {
      return (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>Map unavailable</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function MapContent({ markers, polylines }: Props) {
  const { location } = useUserLocation();

  if (!location) return null;

  const centerCoordinate: [number, number] = [
    location.coords.longitude || -122.4194,
    location.coords.latitude || 37.7749,
  ];

  const routeShape: GeoJSON.Feature<GeoJSON.LineString> | null = polylines
    ? {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: polyline.decode(polylines).map(([lat, lng]) => [lng, lat]),
      },
      properties: {},
    }
    : null;

  return (
    <MapboxGL.MapView style={styles.map} styleURL="mapbox://styles/savaldev/cm15n4dn1001l01qk10xtb9lh">
      <MapboxGL.Camera
        centerCoordinate={centerCoordinate}
        zoomLevel={12}
        animationDuration={0}
      />

      {markers?.map((marker, index) => (
        <CustomMarker
          key={index}
          coordinate={marker.coordinate}
          title={marker.title}
          backgroundColor={marker.backgroundColor}
        />
      ))}

      {routeShape && (
        <MapboxGL.ShapeSource id="routeSource" shape={routeShape}>
          <MapboxGL.LineLayer
            id="routeLine"
            style={{ lineColor: "#0077ffff", lineWidth: 6 }}
          />
        </MapboxGL.ShapeSource>
      )}
    </MapboxGL.MapView>
  );
}

export default function Map(props: Props) {
  return (
    <MapErrorBoundary>
      <MapContent {...props} />
    </MapErrorBoundary>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
  },
  fallbackText: {
    color: "#888",
    fontSize: 14,
  },
});
