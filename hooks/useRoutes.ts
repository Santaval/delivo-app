import { RouteStatus } from "@/components/RouteCard";
import { toast } from "@/context/ToastContext";
import i18n from "@/i18n";
import RoutesService from "@/services/routes/Routes.service";
import { useEffect, useState } from "react";

const useRoutes = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await RoutesService.all();
      setRoutes(response.data);
    } catch (err) {
      setError(i18n.t('loadFailedError'));
      if (routes.length > 0) toast.error(i18n.t('loadFailedError'));
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