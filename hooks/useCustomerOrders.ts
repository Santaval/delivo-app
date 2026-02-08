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
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customerId]);

  return { orders, loading, error };
};

export default useCustomerOrders