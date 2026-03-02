import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

const useUserLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // 1. Request foreground permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // 2. Get the current position
      // Accuracy.Balanced is usually best for maps; 
      // Accuracy.Highest can take a long time to resolve.
      let userLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setLocation(userLocation);
    })();
  }, []);

  const refreshLocation = async () => {
    setLocation(null);
    setErrorMsg(null);
    await Location.requestForegroundPermissionsAsync();
    let userLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    setLocation(userLocation);
  };

  return { location, errorMsg, refreshLocation };
}

export default useUserLocation;