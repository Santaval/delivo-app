import i18n from "@/i18n";
import OrdersService from "@/services/orders/Orders.service";
import { useState } from "react";
import useFocusRefetch from "./useFocusRefetch";

const useCustomerOrders = (customerId: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      const fetchedOrders = await OrdersService.byCustomerId(customerId);
      setOrders(fetchedOrders);
      setError(null);
    } catch (err) {
      setError(i18n.t('loadFailedError'));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Recarga al volver a la pantalla (ej. después de crear una orden del cliente)
  useFocusRefetch((isFirstFocus) => {
    if (isFirstFocus) setLoading(true);
    fetchOrders({ silent: !isFirstFocus });
  }, customerId);

  const refreshOrders = async () => {
    setLoading(true);
    setError(null);
    await fetchOrders();
  };

  return { orders, loading, error, refreshOrders };
};

export default useCustomerOrders
