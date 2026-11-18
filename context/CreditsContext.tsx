import { useCompanies } from "@/context/CompaniesContext";
import useCompanyMembers from "@/hooks/useCompanyMembers";
import { setOnInsufficientCredits } from "@/services/api";
import CreditsService from "@/services/billing/Credits.service";
import type { InsufficientCreditsPayload } from "@/services/errors/InsufficientCredits";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";

const DEFAULT_OVERDRAFT_FLOOR = -5;
const DEFAULT_LOW_BALANCE_THRESHOLD = 10;

type CreditsContextType = {
  /** Company the numbers below belong to (null = nothing loaded for the active company yet). */
  companyId: string | null;
  balance: number | null;
  /** From the API; default until loaded. */
  overdraftFloor: number;
  /** From the API; default until loaded. */
  lowBalanceThreshold: number;
  packs: CreditPack[];
  /** First load for the current company. */
  isLoading: boolean;
  error: boolean;
  isLow: boolean;
  isInOverdraft: boolean;
  isBlocked: boolean;
  myRole: CompanyRole | undefined;
  isRoleLoading: boolean;
  /** OWNER or ADMIN. An unknown role (loading or failed) is treated as not allowed. */
  canPurchase: boolean;
  refresh: () => Promise<CreditsStatus | null>;
  /** Optimistic -1 after a bill is created, followed by a refresh. */
  noteBillIssued: () => void;
  /** Set when the API answered 402 INSUFFICIENT_CREDITS; drives the out-of-credits sheet. */
  outOfCredits: InsufficientCreditsPayload | null;
  dismissOutOfCredits: () => void;
};

const CreditsContext = createContext<CreditsContextType>({
  companyId: null,
  balance: null,
  overdraftFloor: DEFAULT_OVERDRAFT_FLOOR,
  lowBalanceThreshold: DEFAULT_LOW_BALANCE_THRESHOLD,
  packs: [],
  isLoading: false,
  error: false,
  isLow: false,
  isInOverdraft: false,
  isBlocked: false,
  myRole: undefined,
  isRoleLoading: false,
  canPurchase: false,
  refresh: async () => null,
  noteBillIssued: () => {},
  outOfCredits: null,
  dismissOutOfCredits: () => {},
});

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const { activeCompany } = useCompanies();
  const { myRole, loading: isRoleLoading } = useCompanyMembers();
  const activeCompanyId = activeCompany?.id ?? null;

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [overdraftFloor, setOverdraftFloor] = useState(DEFAULT_OVERDRAFT_FLOOR);
  const [lowBalanceThreshold, setLowBalanceThreshold] = useState(DEFAULT_LOW_BALANCE_THRESHOLD);
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [outOfCredits, setOutOfCredits] = useState<InsufficientCreditsPayload | null>(null);
  // Burst guard: parallel 402s must open one sheet. A ref avoids stale closures.
  const shownRef = useRef(false);

  // Responses for an outdated request or a previous company are dropped by comparing
  // against these.
  const activeCompanyIdRef = useRef<string | null>(activeCompanyId);
  activeCompanyIdRef.current = activeCompanyId;
  const requestIdRef = useRef(0);

  const refresh = useCallback(async (): Promise<CreditsStatus | null> => {
    const cid = activeCompanyIdRef.current;
    if (!cid) return null;
    const reqId = ++requestIdRef.current;
    try {
      const status = await CreditsService.getCredits(cid);
      if (reqId !== requestIdRef.current || cid !== activeCompanyIdRef.current) return null;
      setCompanyId(cid);
      setBalance(status.balance);
      setOverdraftFloor(status.overdraftFloor);
      setLowBalanceThreshold(status.lowBalanceThreshold);
      setPacks(status.packs ?? []);
      setError(false);
      return status;
    } catch (err) {
      if (reqId !== requestIdRef.current || cid !== activeCompanyIdRef.current) return null;
      // Background refresh: keep the last good value, no toast.
      console.error("Error fetching credits:", err);
      setError(true);
      return null;
    } finally {
      if (reqId === requestIdRef.current) setIsLoading(false);
    }
  }, []);

  // Company change (or logout): drop the old company's numbers immediately so they
  // never show under the new company's name, then load the new ones.
  useEffect(() => {
    requestIdRef.current++;
    setCompanyId(null);
    setBalance(null);
    setPacks([]);
    setOverdraftFloor(DEFAULT_OVERDRAFT_FLOOR);
    setLowBalanceThreshold(DEFAULT_LOW_BALANCE_THRESHOLD);
    setError(false);
    if (!activeCompanyId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    void refresh();
  }, [activeCompanyId, refresh]);

  // Refresh when the app returns to the foreground (e.g. after buying in a store sheet).
  useEffect(() => {
    let previous: AppStateStatus = AppState.currentState;
    const subscription = AppState.addEventListener("change", (next: AppStateStatus) => {
      if ((previous === "background" || previous === "inactive") && next === "active") {
        void refresh();
      }
      previous = next;
    });
    return () => subscription.remove();
  }, [refresh]);

  const noteBillIssued = useCallback(() => {
    setBalance((b) => (b === null ? b : b - 1));
    void refresh();
  }, [refresh]);

  useEffect(() => {
    setOnInsufficientCredits((payload) => {
      if (shownRef.current) return;
      shownRef.current = true;
      setOutOfCredits(payload);
      if (payload.balance !== null) setBalance(payload.balance);
      void refresh();
    });
    return () => setOnInsufficientCredits(null);
  }, [refresh]);

  const dismissOutOfCredits = useCallback(() => {
    shownRef.current = false;
    setOutOfCredits(null);
  }, []);

  const value = useMemo<CreditsContextType>(
    () => ({
      companyId,
      balance,
      overdraftFloor,
      lowBalanceThreshold,
      packs,
      isLoading,
      error,
      isLow: balance !== null && balance <= lowBalanceThreshold,
      isInOverdraft: balance !== null && balance < 0,
      isBlocked: balance !== null && balance <= overdraftFloor,
      myRole,
      isRoleLoading,
      canPurchase: myRole === "OWNER" || myRole === "ADMIN",
      refresh,
      noteBillIssued,
      outOfCredits,
      dismissOutOfCredits,
    }),
    [
      companyId,
      balance,
      overdraftFloor,
      lowBalanceThreshold,
      packs,
      isLoading,
      error,
      myRole,
      isRoleLoading,
      refresh,
      noteBillIssued,
      outOfCredits,
      dismissOutOfCredits,
    ],
  );

  return <CreditsContext.Provider value={value}>{children}</CreditsContext.Provider>;
}

export const useCredits = () => useContext(CreditsContext);
