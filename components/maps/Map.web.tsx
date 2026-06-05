import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('mapNotAvailableOnWeb')}</Text>
      <Text style={styles.subtext}>{t('useMobileAppForMaps')}</Text>
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
