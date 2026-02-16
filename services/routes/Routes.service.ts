import BaseApiService from "../config/BaseApiService";

export default class RoutesService extends BaseApiService {
  static async all() {
    return this.get<Route[]>('/routes');
  }

  static async create(data: any) {
    return this.post<Route>('/routes', data);
  }

  static async find(id: string) {
    const { data } = await this.get<Route>(`/routes/${id}`);
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