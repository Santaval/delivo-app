import { RouteStatus } from "@/components/RouteCard";
import { toast } from "@/context/ToastContext";
import i18n from "@/i18n";
import useCompanyMembers from "@/hooks/useCompanyMembers";
import RoutesService from "@/services/routes/Routes.service";
import { useEffect, useState } from "react";

const useRoutes = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { canManageRoutes, loading: roleLoading } = useCompanyMembers();
  // Only OWNER/ADMIN list every route. Anyone else (DEALER, or an unknown role
  // because the members request failed) gets just the routes assigned to them.
  const driverId = canManageRoutes ? undefined : "me";

  const fetchRoutes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await RoutesService.all(driverId ? { driverId } : undefined);
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

  // Wait for the role so a DEALER never flashes the full company list
  useEffect(() => {
    if (roleLoading) return;
    fetchRoutes();
  }, [roleLoading, driverId]);

  return { routes, loading, error, filterByStatus, refresh: fetchRoutes };
};

export default useRoutes;