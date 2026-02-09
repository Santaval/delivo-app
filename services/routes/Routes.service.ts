import BaseApiService from "../config/BaseApiService";

export default class RoutesService extends BaseApiService {
  static async all() {
    return this.get<Route[]>('/routes');
  }

  static async create(data: any) {
    return this.post<Route>('/routes', data);
  }

  static async find(id: string) {
    return this.get<Route>(`/routes/${id}`);
  }

  static async addPoint(routeId: string, point: any) {
    return this.post<Route>(`/routes/${routeId}/points`, point);
  }

}