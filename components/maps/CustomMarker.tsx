import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';

type CustomViewMarkerProps = {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  backgroundColor: string;
};

export const CustomMarker = ({ coordinate, title, backgroundColor }: CustomViewMarkerProps) => (
  <Marker
    coordinate={coordinate}
    anchor={{ x: 0.5, y: 0.5 }} // Optional: anchors the center of the view
    onPress={() => console.log('Marker pressed')}
  >
    <View style={[styles.markerContainer, { backgroundColor }]}>
      <Text style={styles.markerText}>{title}</Text>
    </View>
  </Marker>
);

const styles = StyleSheet.create({
  markerContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 5,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  markerImage: {
    width: 40,
    height: 40,
  },
  markerText: {
    fontSize: 8,
    textAlign: 'center',
  },
});
