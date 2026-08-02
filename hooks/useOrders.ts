import { toast } from "@/context/ToastContext";
import i18n from "@/i18n";
import OrdersService from "@/services/orders/Orders.service";
import { useCallback, useMemo, useRef, useState } from "react";
import useFocusRefetch from "./useFocusRefetch";

const useOrders = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const fetchOrders = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!silent) {
      if (hasLoadedRef.current) setIsRefreshing(true);
      else setIsInitialLoading(true);
    }

    try {
      const response = await OrdersService.all();
      setAllOrders(response);
      setError(null);
      hasLoadedRef.current = true;
    } catch (err) {
      setError(i18n.t('loadFailedError'));
      // Mantiene los datos viejos visibles pero avisa que la recarga falló
      if (hasLoadedRef.current) toast.error(i18n.t('loadFailedError'));
      console.error('Error fetching orders:', err);
    } finally {
      isFetchingRef.current = false;
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Recarga al volver a la pantalla (ej. después de crear una orden)
  useFocusRefetch((isFirstFocus) => {
    fetchOrders({ silent: !isFirstFocus });
  });

  const orders = useMemo(() => {
    if (!query) return allOrders;

    return allOrders.filter(order =>
      order.client.name.toLowerCase().includes(query.toLowerCase()) ||
      order.number.toString().includes(query)
    );
  }, [allOrders, query]);

  return {
    orders,
    loading: isInitialLoading || isRefreshing,
    isInitialLoading,
    isRefreshing,
    error,
    refresh: fetchOrders,
    search: setQuery,
  };
};

export default useOrders;
