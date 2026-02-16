
import { useRoute } from '@/context/RouteContext';
import RouteDeliveryScreen from './RouteDelivery';
import RouteFinishedScreen from './RouteFinished';
import RoutePlanningScreen from './RoutePlanning';

export default function RouteScreenManager() {
  const { route } = useRoute();
  if (!route) return null;
  switch (route?.status) {
    case 'CREATED':
      return <RoutePlanningScreen />;
    case 'STARTED':
      return <RouteDeliveryScreen />;
    case 'COMPLETED':
      return <RouteFinishedScreen />;
    default:
      return <RoutePlanningScreen />;
  }
}