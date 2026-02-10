
import { useRoute } from '@/context/RouteContext';
import RoutePlanningScreen from './RoutePlanning';

export default function RouteScreenManager() {
  const { route } = useRoute();
  if (!route) return null;
  switch (route?.status) {
    case 'CREATED':
      return <RoutePlanningScreen />;
    // case 'STARTED':
    //   return <InactiveRouteScreen />;
    default:
      return <RoutePlanningScreen />;
  }
}