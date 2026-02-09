import { StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

type MarkerProps = {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  description: string;
};

type Props = {
  markers?: MarkerProps[];
};

export default function Map({ markers }: Props) {

  // const { location} = useUserLocation()

  return (
    <MapView
      style={styles.map}
      // provider={PROVIDER_GOOGLE}
      initialRegion={{
        latitude: 10.6305,
        longitude: -85.4393,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
  >

    {markers?.map((marker, index) => (
      <Marker
        key={index}
        coordinate={marker.coordinate}
        title={marker.title}
        description={marker.description}
      />
    ))}

  </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
