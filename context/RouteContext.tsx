import RoutesService from "@/services/routes/Routes.service";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

/**
 * Represents the route state of the application
 * @interface RouteState
 */
interface RouteState {
  /** Current route data */
  route: Route | null;
  /** Whether a route operation is in progress */
  isLoading: boolean;
  /** Current error message, if any */
  error: string | null;
}

/**
 * Defines the shape of the route context
 * @interface RouteContextType
 */
interface RouteContextType extends RouteState {
  /** Function to fetch a route by ID */
  fetchRoute: (routeId: string) => Promise<void>;
  /** Function to clear the current route */
  clearRoute: () => void;
  /** Function to update the current route */
  updateRoute: (route: Route) => void;
  /** Function to clear error */
  clearError: () => void;
}

/**
 * Context for managing route state
 */
const RouteContext = createContext<RouteContextType | undefined>(undefined);

/**
 * Props for the RouteProvider component
 */
interface RouteProviderProps {
  children: ReactNode;
  routeId?: string;
}

/**
 * Provider component for route context
 * @param children - Child components that will have access to the route context
 * @param routeId - Optional route ID to automatically fetch on mount/change
 */
export const RouteProvider = ({ children, routeId }: RouteProviderProps) => {
  const [route, setRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches a route by ID
   * @param id - The ID of the route to fetch
   */
  const fetchRoute = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const routeData = await RoutesService.find(id);
      setRoute(routeData);
    } catch (err) {
      setError('Failed to load route');
      console.error('Failed to fetch route:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch route when routeId prop changes
  useEffect(() => {
    if (routeId) {
      fetchRoute(routeId);
    } else {
      clearRoute();
    }
  }, [routeId]);

  /**
   * Clears the current route
   */
  const clearRoute = () => {
    setRoute(null);
    setError(null);
  };

  /**
   * Updates the current route
   * @param route - The route data to set
   */
  const updateRoute = (route: Route) => {
    setRoute(route);
    setError(null);
  };

  /**
   * Clears the current error
   */
  const clearError = () => {
    setError(null);
  };

  const value: RouteContextType = {
    route,
    isLoading,
    error,
    fetchRoute,
    clearRoute,
    updateRoute,
    clearError,
  };

  return (
    <RouteContext.Provider value={value}>
      {children}
    </RouteContext.Provider>
  );
};

/**
 * Custom hook to access the route context
 * @returns The route context value
 * @throws Error if used outside of RouteProvider
 */
export const useRoute = (): RouteContextType => {
  const context = useContext(RouteContext);
  if (context === undefined) {
    throw new Error('useRoute must be used within a RouteProvider');
  }
  return context;
};

export default RouteContext;
