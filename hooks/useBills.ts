import { toast } from "@/context/ToastContext";
import i18n from "@/i18n";
import BillsService from "@/services/orders/Bills.service";
import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_SIZE = 20;

type FetchMode = "initial" | "refresh" | "more";

/**
 * Paginated bills for the current company, filtered by payment status and search.
 * Changing the status or search resets the list and loads page 1.
 */
const useBills = (initialStatus: BillsStatusFilter = "PENDING") => {
  const [status, setStatus] = useState<BillsStatusFilter>(initialStatus);
  const [query, setQuery] = useState("");

  const [bills, setBills] = useState<Order[]>([]);
  const [counts, setCounts] = useState<BillsCounts | null>(null);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Responses for an outdated filter/search are dropped by comparing against this id.
  const requestIdRef = useRef(0);
  // Token of the in-flight load-more. FlashList can fire onEndReached several times
  // before state updates land, so this ref (not state) guards against duplicate fetches.
  const activeMoreRef = useRef<symbol | null>(null);

  const fetchPage = useCallback(
    async (pageToLoad: number, mode: FetchMode) => {
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
        const result = await BillsService.page({
          page: pageToLoad,
          pageSize: PAGE_SIZE,
          status,
          search: query,
        });
        if (requestId !== requestIdRef.current) return;

        setBills((prev) => {
          if (mode !== "more") return result.data;
          // Offsets can shift when bills are created or paid meanwhile; skip duplicates.
          const seen = new Set(prev.map((bill) => bill.id));
          return [...prev, ...result.data.filter((bill) => !seen.has(bill.id))];
        });
        setCounts(result.counts);
        setPage(result.pagination.page);
        setHasNextPage(result.pagination.hasNextPage);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error("Error fetching bills:", err);
        if (mode === "initial") {
          setBills([]);
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
    [status, query],
  );

  useEffect(() => {
    setBills([]);
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

  // Must be stable: SearchBar re-runs its debounce effect whenever onSearch changes.
  const search = useCallback((value: string) => setQuery(value.trim()), []);

  return {
    bills,
    counts,
    status,
    setStatus,
    query,
    search,
    loading,
    refreshing,
    loadingMore,
    hasNextPage,
    error,
    refresh,
    loadMore,
  };
};

export default useBills;
