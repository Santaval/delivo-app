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
  /** Deja el marcador fuera del cálculo del encuadre (p. ej. la posición del usuario, que se mueve). */
  excludeFromFit?: boolean;
};

type Props = {
  markers?: MarkerProps[];
  polylines?: string;
  /** Ajusta la cámara para que todos los marcadores y la ruta queden visibles. */
  fitToMarkers?: boolean;
};

const FIT_PADDING = 60;
const SINGLE_POINT_ZOOM = 14;

function getBounds(coordinates: [number, number][]) {
  if (coordinates.length === 0) return null;

  const longitudes = coordinates.map(([lng]) => lng);
  const latitudes = coordinates.map(([, lat]) => lat);

  return {
    sw: [Math.min(...longitudes), Math.min(...latitudes)] as [number, number],
    ne: [Math.max(...longitudes), Math.max(...latitudes)] as [number, number],
  };
}

class MapErrorBoundary extends Component<
  { children: ReactNode },
  { crashed: boolean }
> {
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

function MapContent({ markers, polylines, fitToMarkers }: Props) {
  const { location } = useUserLocation();

  const routeCoordinates: [number, number][] = polylines
    ? polyline
        .decode(polylines)
        .map(([lat, lng]) => [lng, lat] as [number, number])
    : [];

  const routeShape: GeoJSON.Feature<GeoJSON.LineString> | null = polylines
    ? {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: routeCoordinates,
        },
        properties: {},
      }
    : null;

  const fitCoordinates: [number, number][] = fitToMarkers
    ? [
        ...(markers ?? [])
          .filter((marker) => !marker.excludeFromFit)
          .map(
            (marker) =>
              [marker.coordinate.longitude, marker.coordinate.latitude] as [
                number,
                number,
              ],
          ),
        ...routeCoordinates,
      ]
    : [];

  const bounds = getBounds(fitCoordinates);

  // Sin puntos que encuadrar dependemos de la ubicación del usuario para centrar el mapa.
  if (!bounds && !location) return null;

  const cameraProps = bounds
    ? bounds.sw[0] === bounds.ne[0] && bounds.sw[1] === bounds.ne[1]
      ? { centerCoordinate: bounds.sw, zoomLevel: SINGLE_POINT_ZOOM }
      : {
          bounds,
          padding: {
            paddingTop: FIT_PADDING,
            paddingBottom: FIT_PADDING,
            paddingLeft: FIT_PADDING,
            paddingRight: FIT_PADDING,
          },
        }
    : {
        centerCoordinate: [
          location!.coords.longitude || -122.4194,
          location!.coords.latitude || 37.7749,
        ] as [number, number],
        zoomLevel: 12,
      };

  return (
    <MapboxGL.MapView
      style={styles.map}
      styleURL="mapbox://styles/savaldev/cm15n4dn1001l01qk10xtb9lh"
    >
      <MapboxGL.Camera {...cameraProps} animationDuration={0} />

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
