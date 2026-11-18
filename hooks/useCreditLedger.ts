import { useCompanies } from "@/context/CompaniesContext";
import { toast } from "@/context/ToastContext";
import i18n from "@/i18n";
import CreditsService from "@/services/billing/Credits.service";
import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_SIZE = 20;

type FetchMode = "initial" | "refresh" | "more";

/** Paginated credit ledger (newest first) of the active company. */
const useCreditLedger = () => {
  const { activeCompany } = useCompanies();
  const companyId = activeCompany?.id;

  const [entries, setEntries] = useState<CreditLedgerEntry[]>([]);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Responses for an outdated company/reload are dropped by comparing against this id.
  const requestIdRef = useRef(0);
  // Token of the in-flight load-more; a ref (not state) because onEndReached can fire
  // several times before state updates land.
  const activeMoreRef = useRef<symbol | null>(null);

  const fetchPage = useCallback(
    async (pageToLoad: number, mode: FetchMode) => {
      if (!companyId) return;
      const requestId = mode === "more" ? requestIdRef.current : ++requestIdRef.current;
      const moreToken = Symbol("loadMore");

      if (mode === "initial") setLoading(true);
      if (mode === "refresh") setRefreshing(true);
      if (mode === "more") {
        activeMoreRef.current = moreToken;
        setLoadingMore(true);
      }
      if (mode !== "more") setError(null);

      try {
        const result = await CreditsService.getLedger(companyId, pageToLoad, PAGE_SIZE);
        if (requestId !== requestIdRef.current) return;

        setEntries((prev) => {
          if (mode !== "more") return result.data;
          // Offsets shift when new entries land meanwhile; skip duplicates.
          const seen = new Set(prev.map((entry) => entry.id));
          return [...prev, ...result.data.filter((entry) => !seen.has(entry.id))];
        });
        setPage(result.pagination.page);
        setHasNextPage(result.pagination.hasNextPage);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error("Error fetching credit ledger:", err);
        if (mode === "initial") {
          setEntries([]);
          setError(i18n.t("loadFailedError"));
        } else {
          toast.error(i18n.t("loadFailedError"));
        }
      } finally {
        if (mode === "more" && activeMoreRef.current === moreToken) {
          activeMoreRef.current = null;
          setLoadingMore(false);
        }
        if (requestId === requestIdRef.current) {
          if (mode === "initial") setLoading(false);
          if (mode === "refresh") setRefreshing(false);
        }
      }
    },
    [companyId],
  );

  useEffect(() => {
    setEntries([]);
    setPage(0);
    setHasNextPage(false);
    setRefreshing(false);
    setLoadingMore(false);
    activeMoreRef.current = null;
    fetchPage(1, "initial");
  }, [fetchPage]);

  const refresh = useCallback(() => fetchPage(1, "refresh"), [fetchPage]);

  const loadMore = useCallback(() => {
    if (!hasNextPage || loading || refreshing || activeMoreRef.current) return;
    fetchPage(page + 1, "more");
  }, [fetchPage, hasNextPage, loading, refreshing, page]);

  return { entries, loading, refreshing, loadingMore, error, hasNextPage, refresh, loadMore };
};

export default useCreditLedger;
