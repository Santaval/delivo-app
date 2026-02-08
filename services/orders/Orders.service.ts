import BaseApiService from "../config/BaseApiService";

export default class OrdersService extends BaseApiService {

  static async create(data: any): Promise<Order> {
    const { data: order } = await this.post<Order>('/orders', data);
    return order;
  }

  static async getOrderById(id: string): Promise<Order | null> {
    const { data: order } = await this.get<Order>(`/orders/${id}`);
    return order || null;
  }

  static async addItemToOrder(orderId: string, item: any): Promise<void> {
    await this.post(`/orders/${orderId}/items`, item);
  }

  static async byCustomerId(customerId: string): Promise<Order[]> {
    const { data: orders } = await this.get<Order[]>(`/orders/client/${customerId}`);
    return orders;
  }

}