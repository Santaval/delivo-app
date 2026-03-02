import BaseApiService from "../config/BaseApiService";

export default class OrdersService extends BaseApiService {

  static async all(): Promise<Order[]> {
    const { data: orders } = await this.get<Order[]>('/orders');
    return orders;
  }

  static async create(data: any): Promise<Order> {
    const { data: order } = await this.post<Order>('/orders', data);
    return order;
  }

  static async getOrderById(id: string): Promise<Order | null> {
    const { data: order } = await this.get<Order>(`/orders/${id}`);
    return order || null;
  }

  static async addItemToOrder(orderId: string, item: any): Promise<void> {
    console.log(`Adding item to order ${orderId}:`, item);
    await this.post(`/orders/${orderId}/items`, item);
  }

  static async removeItemFromOrder(orderId: string, itemId: string): Promise<void> {
    await this.delete(`/orders/${orderId}/items/${itemId}`);
  }

  static async markAsDelivered(orderId: string): Promise<void> {
    await this.patch(`/orders/${orderId}/delivered`, {});
  }

  static async byCustomerId(customerId: string): Promise<Order[]> {
    const { data: orders } = await this.get<Order[]>(`/orders/client/${customerId}`);
    return orders;
  }

  static async addPayment(orderId: string, amount: number, methodId: string): Promise<void> {
    await this.post(`/orders/${orderId}/payments`, { amount, methodId });
  }

}