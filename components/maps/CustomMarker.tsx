import MapboxGL from '@rnmapbox/maps';
import { StyleSheet, Text, View } from 'react-native';

type CustomViewMarkerProps = {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  backgroundColor: string;
};

export const CustomMarker = ({ coordinate, title, backgroundColor }: CustomViewMarkerProps) => (
  <MapboxGL.PointAnnotation
    id={`marker-${coordinate.latitude}-${coordinate.longitude}`}
    coordinate={[coordinate.longitude, coordinate.latitude]}
  >
    <View style={[styles.markerContainer, { backgroundColor }]}>
      <Text style={styles.markerText}>{title}</Text>
    </View>
  </MapboxGL.PointAnnotation>
);

const styles = StyleSheet.create({
  markerContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    padding: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  markerText: {
    fontSize: 8,
    textAlign: 'center',
    color: '#fff',
  },
});
