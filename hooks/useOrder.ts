import { OrderItem } from "@/components";
import OrdersService from "@/services/orders/Orders.service";
import { useEffect, useState } from "react";

const useOrder = (orderId: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const orderData = await OrdersService.getOrderById(orderId);
      setOrder(orderData);
    } catch (err) {
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const addItems = async (orderItems: OrderItem[]) => {
    try {
      if (!order) return;
      setLoading(true);
      for (const item of orderItems) {
        await OrdersService.addItemToOrder(order.id, {
          productId: item.product.id,
          quantity: item.quantity,
        });
      }
      await fetchOrder();
    } catch (err) {
      console.error('Failed to add products', err);
      setError('Failed to add products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  return { order, loading, error, refresh: fetchOrder, addItems };
}

export default useOrder;