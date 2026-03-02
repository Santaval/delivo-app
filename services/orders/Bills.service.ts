import BaseApiService from "../config/BaseApiService";

export default class BillsService extends BaseApiService {

  static async all(): Promise<Order[]> {
    const { data: orders } = await this.get<Order[]>('/orders/bills');
    return orders;
  }



}