import { toast } from "@/context/ToastContext";
import i18n from "@/i18n";
import BillsService from "@/services/orders/Bills.service";
import { useEffect, useState } from "react";

const useBills = () => {
  const [bills, setBills] = useState<Order[]>([]);
  const [originalBills, setOriginalBills] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await BillsService.all();
      setBills(response);
      setOriginalBills(response);
    } catch (err) {
      setError(i18n.t('loadFailedError'));
      if (originalBills.length > 0) toast.error(i18n.t('loadFailedError'));
      console.error('Error fetching bills:', err);
    } finally {
      setLoading(false);
    }
  };

  const search = (query: string) => {
    if (!query) {
      setBills(originalBills);
      return;
    }

    const filtered = originalBills.filter(bill =>
      bill.client.name.toLowerCase().includes(query.toLowerCase()) ||
      bill.number.toString().includes(query)
    );
    setBills(filtered);
  };

  useEffect(() => {
    fetchBills();
  }, []);

  return { bills, loading, error, refresh: fetchBills, search };
};

export default useBills;
