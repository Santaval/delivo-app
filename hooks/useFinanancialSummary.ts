import StatsService from "@/services/stats/Stats.service";
import { useEffect, useState } from "react";

const useFinancialSummary = () => {
  const [data, setData] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await StatsService.financialSummary();
        setData(result);
      } catch (error) {
        setError('Error fetching financial summary');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export default useFinancialSummary;
