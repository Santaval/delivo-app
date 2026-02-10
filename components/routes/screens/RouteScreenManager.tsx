
import { useRoute } from '@/context/RouteContext';
import RouteDeliveryScreen from './RouteDelivery';
import RoutePlanningScreen from './RoutePlanning';

export default function RouteScreenManager() {
  const { route } = useRoute();
  if (!route) return null;
  switch (route?.status) {
    case 'CREATED':
      return <RoutePlanningScreen />;
    case 'STARTED':
      return <RouteDeliveryScreen />;
    default:
      return <RoutePlanningScreen />;
  }
}