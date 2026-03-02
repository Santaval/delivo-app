import useUserLocation from "@/hooks/useUserLocation";
import polyline from "@mapbox/polyline";
import { StyleSheet } from "react-native";
import MapView, { Polyline } from "react-native-maps";
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
  polylines?: string
};

export default function Map({ markers, polylines }: Props) {

  const { location } = useUserLocation()

  if (!location) return null;

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: location?.coords.latitude || 37.7749,
        longitude: location?.coords.longitude || -122.4194,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
  >

    {markers?.map((marker, index) => (
      <CustomMarker
        key={index}
        coordinate={marker.coordinate}
        title={marker.title}
        backgroundColor={marker.backgroundColor}

      />
    ))}

    {polylines && (
      <Polyline
        coordinates={polyline.decode(polylines).map(([lat, lng]) => ({ latitude: lat, longitude: lng }))}
        strokeColor="#000"
        strokeWidth={6}
      />
    )}

  </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
