import PlacesService from "@/services/geolocation/places.service";
import { useCallback, useRef, useState } from "react";

const useGeolsocation = () => {
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const latestQueryRef = useRef("");

  const autocomplete = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setLocations([]);
      setIsLoading(false);
      return;
    }

    latestQueryRef.current = trimmedQuery;
    setIsLoading(true);

    try {
      const data = await PlacesService.autocomplete(trimmedQuery);

      if (latestQueryRef.current === trimmedQuery) {
        setLocations(data);
      }
    } catch {
    } finally {
      if (latestQueryRef.current === trimmedQuery) {
        setIsLoading(false);
      }
    }
  }, []);

  const clearLocations = useCallback(() => {
    latestQueryRef.current = "";
    setLocations([]);
    setIsLoading(false);
  }, []);

  return {
    locations,
    autocomplete,
    clearLocations,
    isLoading,
  };
};

export default useGeolsocation;