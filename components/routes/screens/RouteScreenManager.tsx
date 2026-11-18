import { useAuth } from '@/context/AuthContext';
import { useRoute } from '@/context/RouteContext';
import useDriverTracking, { DriverTrackingContext } from '@/hooks/useDriverTracking';
import { useEffect } from 'react';
import RouteDeliveryScreen from './RouteDelivery';
import RouteFinishedScreen from './RouteFinished';
import RoutePlanningScreen from './RoutePlanning';

export default function RouteScreenManager() {
  const { route } = useRoute();
  const { user } = useAuth();
  const tracking = useDriverTracking();
  const { start, stop } = tracking;

  const routeId = route?.id;
  const status = route?.status;
  const isDriver = !!user && !!route && route.driverId === user.id;

  // Only the assigned driver shares their position, only while the route is STARTED.
  // This one effect covers "the route was just started" and "the app was opened
  // with an own STARTED route": `start` is a no-op when the updates already run.
  useEffect(() => {
    if (!routeId) return;
    if (status === 'STARTED' && isDriver) {
      start(routeId);
    } else if (status === 'COMPLETED' || (status === 'STARTED' && !isDriver)) {
      // Finished, or reassigned to someone else: make sure nothing keeps running
      stop(routeId);
    }
  }, [routeId, status, isDriver, start, stop]);

  if (!route) return null;

  const screen = (() => {
    switch (route.status) {
      case 'CREATED':
        return <RoutePlanningScreen />;
      case 'STARTED':
        return <RouteDeliveryScreen />;
      case 'COMPLETED':
        return <RouteFinishedScreen />;
      default:
        return <RoutePlanningScreen />;
    }
  })();

  return (
    <DriverTrackingContext.Provider value={tracking}>{screen}</DriverTrackingContext.Provider>
  );
}
