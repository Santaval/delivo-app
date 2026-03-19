import OrdersService from "@/services/orders/Orders.service";
import { useEffect, useState } from "react";

const useCustomerBills = (customerId: string) => {
  const [bills, setBills] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const fetchedBills = await OrdersService.byCustomerIdBilled(customerId);
        setBills(fetchedBills);
      } catch (err) {
        setError("Failed to fetch bills");
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [customerId]);

  const refreshBills = async () => {
    setLoading(true);
    try {
      const fetchedBills = await OrdersService.byCustomerIdBilled(customerId);
      setBills(fetchedBills);
    } catch (err) {
      setError("Failed to fetch bills");
    } finally {
      setLoading(false);
    }
  };

  return { bills, loading, error, refreshBills };
};

export default useCustomerBills;
