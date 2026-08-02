import i18n from '@/i18n';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, Linking } from 'react-native';

/**
 * Requests foreground location permission, showing an in-app rationale
 * before triggering the OS prompt so the user understands why.
 * Returns true when permission is granted.
 */
const requestPermissionWithRationale = async (): Promise<boolean> => {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.status === 'granted') return true;
  if (!current.canAskAgain) return false;

  const proceed = await new Promise<boolean>((resolve) => {
    Alert.alert(
      i18n.t('locationRationaleTitle'),
      i18n.t('locationRationaleMessage'),
      [
        { text: i18n.t('cancel'), style: 'cancel', onPress: () => resolve(false) },
        { text: i18n.t('continueLabel'), onPress: () => resolve(true) },
      ],
    );
  });
  if (!proceed) return false;

  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};

const useUserLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const fetchLocation = async () => {
    const granted = await requestPermissionWithRationale();

    if (!granted) {
      setPermissionDenied(true);
      setErrorMsg(i18n.t('locationDeniedMessage'));
      return;
    }

    setPermissionDenied(false);
    // Accuracy.Balanced is usually best for maps;
    // Accuracy.Highest can take a long time to resolve.
    const userLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    setLocation(userLocation);
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const refreshLocation = async () => {
    setLocation(null);
    setErrorMsg(null);
    await fetchLocation();
  };

  const openSettings = () => Linking.openSettings();

  return { location, errorMsg, permissionDenied, refreshLocation, openSettings };
}

export default useUserLocation;
