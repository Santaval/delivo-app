import { OrderItem } from "@/components";
import i18n from "@/i18n";
import OrdersService from "@/services/orders/Orders.service";
import { useEffect, useState } from "react";

const useOrder = (orderId: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async ({ silent }: { silent?: boolean } = {}) => {
    try {
      setError(null);
      const orderData = await OrdersService.getOrderById(orderId);
      setOrder(orderData);
    } catch (err) {
      setError(i18n.t('loadFailedError'));
    } finally {
      if (!silent) {
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  const refresh = async () => {
    if (order) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoading(true);
    }
    await fetchOrder();
  };

  const addItems = async (orderItems: OrderItem[]) => {
    try {
      if (!order) return;
      setIsMutating(true);
      for (const item of orderItems) {
        await OrdersService.addItemToOrder(order.id, {
          productId: item.product.id,
          quantity: item.quantity,
        });
      }
      await fetchOrder({ silent: true });
    } catch (err) {
      console.error('Failed to add products', err);
      setError('Failed to add products');
    } finally {
      setIsMutating(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      if (!order) return;
      setIsMutating(true);
      await OrdersService.removeItemFromOrder(order.id, itemId);
      await fetchOrder({ silent: true });
    } catch (err) {
      console.error('Failed to remove product', err);
      setError('Failed to remove product');
    } finally {
      setIsMutating(false);
    }
  };

  const markAsDelivered = async () => {
    try {
      if (!order) return;
      setIsMutating(true);
      await OrdersService.markAsDelivered(order.id);
      await fetchOrder({ silent: true });
    } catch (err) {
      console.error('Failed to mark as delivered', err);
      setError('Failed to mark as delivered');
    } finally {
      setIsMutating(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const loading = isInitialLoading || isRefreshing || isMutating;

  return {
    order,
    loading,
    isInitialLoading,
    isRefreshing,
    isMutating,
    error,
    refresh,
    addItems,
    removeItem,
    markAsDelivered,
  };
}

export default useOrder;
