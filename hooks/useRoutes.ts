import { RouteStatus } from "@/components/RouteCard";
import RoutesService from "@/services/routes/Routes.service";
import { useEffect, useState } from "react";

const useRoutes = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const response = await RoutesService.all();
      setRoutes(response.data);
    } catch (err) {
      setError('Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  const filterByStatus = (status: RouteStatus) => {
    return routes.filter(route => route.status === status);
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  return { routes, loading, error, filterByStatus, refresh: fetchRoutes };
};

export default useRoutes;