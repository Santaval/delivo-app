import i18n from "@/i18n";
import StatsService from "@/services/stats/Stats.service";
import { useEffect, useState } from "react";

const useFinancialSummary = () => {
  const [data, setData] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await StatsService.financialSummary();
      setData(result);
    } catch (err) {
      setError(i18n.t('loadFailedError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refresh: fetchData };
};

export default useFinancialSummary;
