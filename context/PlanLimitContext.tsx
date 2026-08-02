import { setOnPlanLimitExceeded } from '@/services/api';
import type { PlanLimitPayload } from '@/services/errors/PlanLimit';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

type PlanLimitContextType = {
  /** Details of the limit that was hit, read by the /plan-limit screen. */
  payload: PlanLimitPayload | null;
  /** True while a plan limit is pending display — app/_layout.tsx navigates to the plan-limit route when this flips true. */
  shouldShowPlanLimit: boolean;
  /** Flags a plan limit as pending (the 402 interceptor does this automatically). */
  showPlanLimit: (payload: PlanLimitPayload | null) => void;
  /** Called by the screen on unmount so a later 402 can navigate again. */
  clearPlanLimit: () => void;
};

const PlanLimitContext = createContext<PlanLimitContextType>({
  payload: null,
  shouldShowPlanLimit: false,
  showPlanLimit: () => {},
  clearPlanLimit: () => {},
});

export function PlanLimitProvider({ children }: { children: React.ReactNode }) {
  const [payload, setPayload] = useState<PlanLimitPayload | null>(null);
  const [shouldShowPlanLimit, setShouldShowPlanLimit] = useState(false);

  const showPlanLimit = useCallback(
    (next: PlanLimitPayload | null) => {
      // A burst of parallel 402s should only trigger one navigation
      if (shouldShowPlanLimit) return;
      setPayload(next);
      setShouldShowPlanLimit(true);
    },
    [shouldShowPlanLimit],
  );

  // Only releases the guard — `payload` is left in place so the screen doesn't
  // blank out mid dismiss-animation, and it's always overwritten before the
  // next navigation anyway.
  const clearPlanLimit = useCallback(() => {
    setShouldShowPlanLimit(false);
  }, []);

  useEffect(() => {
    setOnPlanLimitExceeded(showPlanLimit);
    return () => setOnPlanLimitExceeded(null);
  }, [showPlanLimit]);

  return (
    <PlanLimitContext.Provider
      value={{ payload, shouldShowPlanLimit, showPlanLimit, clearPlanLimit }}
    >
      {children}
    </PlanLimitContext.Provider>
  );
}

export const usePlanLimit = () => useContext(PlanLimitContext);
