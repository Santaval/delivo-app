import { Order } from "@/types/Order";
import BaseApiService from "../config/BaseApiService";

export default class OrdersService extends BaseApiService {

  static async create(data: any): Promise<Order> {
    const { data: order } = await this.post<Order>('/orders', data);
    return order;
  }

  static async addItemToOrder(orderId: string, item: any): Promise<void> {
    await this.post(`/orders/${orderId}/items`, item);
  }

}