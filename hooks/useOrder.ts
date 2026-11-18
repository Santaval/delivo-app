import { OrderItem } from "@/components";
import i18n from "@/i18n";
import OrdersService from "@/services/orders/Orders.service";
import RoutesService from "@/services/routes/Routes.service";
import { useState } from "react";
import useFocusRefetch from "./useFocusRefetch";

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

  /**
   * Adds the order as a stop of a (not yet started) route, then reloads it so
   * `route` and `deliveryStatus` reflect the change. Rethrows so the screen can
   * tell "already on a route" (409) apart from other failures.
   */
  const addToRoute = async (routeId: string) => {
    if (!order) return;
    setIsMutating(true);
    try {
      await RoutesService.addPoint(routeId, order.id);
      await fetchOrder({ silent: true });
    } finally {
      setIsMutating(false);
    }
  };

  // Recarga al volver a la pantalla (ej. después de una pantalla hija)
  useFocusRefetch((isFirstFocus) => {
    if (isFirstFocus) setIsInitialLoading(true);
    fetchOrder({ silent: !isFirstFocus });
  }, orderId);

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
    addToRoute,
  };
}

export default useOrder;
