import { StyleSheet, Text, View } from "react-native";

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
  polylines?: string
};

export default function Map({ markers, polylines }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map view is not available on web</Text>
      <Text style={styles.subtext}>Please use the mobile app to view maps</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#999',
  },
});
