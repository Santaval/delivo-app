import { toast } from "@/context/ToastContext";
import i18n from "@/i18n";
import OrdersService from "@/services/orders/Orders.service";
import { useEffect, useState } from "react";

const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [originalOrders, setOriginalOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await OrdersService.all();
      setOrders(response);
      setOriginalOrders(response);
    } catch (err) {
      setError(i18n.t('loadFailedError'));
      // Keep stale data visible but tell the user the refresh failed
      if (originalOrders.length > 0) toast.error(i18n.t('loadFailedError'));
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const search = (query: string) => {
    if (!query) {
      setOrders(originalOrders);
      return;
    }

    const filtered = originalOrders.filter(order =>
      order.client.name.toLowerCase().includes(query.toLowerCase()) ||
      order.number.toString().includes(query)
    );
    setOrders(filtered);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, error, refresh: fetchOrders, search };
};

export default useOrders;
