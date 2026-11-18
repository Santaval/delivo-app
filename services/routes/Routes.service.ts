import BaseApiService from "../config/BaseApiService";

export interface RoutesFilters {
  driverId?: "me" | string;
}

export interface CreateRouteData {
  name: string;
  driverId?: string;
}

export default class RoutesService extends BaseApiService {
  /** `driverId: "me"` lists only the routes assigned to the current user. */
  static async all(params?: RoutesFilters) {
    return this.get<Route[]>('/routes', params?.driverId ? { params } : undefined);
  }

  static async create(data: CreateRouteData) {
    const { data: route } = await this.post<Route>('/routes', data);
    return route;
  }

  static async find(id: string) {
    const { data } = await this.get<Route>(`/routes/${id}`);
    return data;
  }

  /** Assigns (or unassigns with `null`) the driver. Rejects with 422 (not a company member) or 409 (route COMPLETED). */
  static async assignDriver(routeId: string, driverId: string | null) {
    const { data } = await this.patch<Route>(`/routes/${routeId}/driver`, { driverId });
    return data;
  }

  static async addPoint(routeId: string, orderId: string) {
    const { data } = await this.post<Route>(`/routes/${routeId}/points`, {
      orderId
    });
    return data;
  }

  static async startNavigation(routeId: string, startLocation: LocationCords) {
    const { data } = await this.post<Route>(`/routes/${routeId}/start`, {
      startLocation
    });
    return data;
  }

  static async completeDelivery(pointId: string) {
    const { data } = await this.patch<RoutePoint>(`/routes/points/${pointId}/complete`, {});
    return data;
  }
}