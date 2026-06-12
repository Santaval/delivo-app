import i18n from "@/i18n";
import OrdersService from "@/services/orders/Orders.service";
import { useEffect, useState } from "react";

const useCustomerOrders = (customerId: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const fetchedOrders = await OrdersService.byCustomerId(customerId);
        setOrders(fetchedOrders);
      } catch (err) {
        setError(i18n.t('loadFailedError'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customerId]);

  const refreshOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedOrders = await OrdersService.byCustomerId(customerId);
      setOrders(fetchedOrders);
    } catch (err) {
      setError(i18n.t('loadFailedError'));
    } finally {
      setLoading(false);
    }
  };

  return { orders, loading, error, refreshOrders };
};

export default useCustomerOrders