import RoutesService from "@/services/routes/Routes.service";
import { useEffect, useState } from "react";

const useRoute = (routeId: string) => {
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const routeData = await RoutesService.find(routeId);
        setRoute(routeData);
      } catch (err) {
        setError('Failed to load route');
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [routeId]);

  return { route, loading, error };
};

export default useRoute;
