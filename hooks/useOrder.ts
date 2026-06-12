import { OrderItem } from "@/components";
import i18n from "@/i18n";
import OrdersService from "@/services/orders/Orders.service";
import { useEffect, useState } from "react";

const useOrder = (orderId: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const orderData = await OrdersService.getOrderById(orderId);
      setOrder(orderData);
    } catch (err) {
      setError(i18n.t('loadFailedError'));
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

  const removeItem = async (itemId: string) => {
    try {
      if (!order) return;
      setLoading(true);
      await OrdersService.removeItemFromOrder(order.id, itemId);
      await fetchOrder();
    } catch (err) {
      console.error('Failed to remove product', err);
      setError('Failed to remove product');
    } finally {
      setLoading(false);
    }
  };

  const markAsDelivered = async () => {
    try {
      if (!order) return;
      setLoading(true);
      await OrdersService.markAsDelivered(order.id);
      await fetchOrder();
    } catch (err) {
      console.error('Failed to mark as delivered', err);
      setError('Failed to mark as delivered');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  return { order, loading, error, refresh: fetchOrder, addItems, removeItem, markAsDelivered };
}

export default useOrder;