import { Routes } from '@/constants';
import { setOnPlanLimitExceeded } from '@/services/api';
import type { PlanLimitPayload } from '@/services/errors/PlanLimit';
import { router } from 'expo-router';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

type PlanLimitContextType = {
  /** Details of the limit that was hit, read by the /plan-limit screen. */
  payload: PlanLimitPayload | null;
  /** Route to the plan-limit screen (the 402 interceptor does this automatically). */
  showPlanLimit: (payload: PlanLimitPayload | null) => void;
  /** Called by the screen on unmount so a later 402 can navigate again. */
  clearPlanLimit: () => void;
};

const PlanLimitContext = createContext<PlanLimitContextType>({
  payload: null,
  showPlanLimit: () => {},
  clearPlanLimit: () => {},
});

export function PlanLimitProvider({ children }: { children: React.ReactNode }) {
  const [payload, setPayload] = useState<PlanLimitPayload | null>(null);
  const isShowing = useRef(false);

  const showPlanLimit = useCallback((next: PlanLimitPayload | null) => {
    // A burst of parallel 402s should only push one screen
    if (isShowing.current) return;
    isShowing.current = true;
    setPayload(next);
    router.push(Routes.planLimit);
  }, []);

  // Only releases the guard — `payload` is left in place so the screen doesn't
  // blank out mid dismiss-animation, and it's always overwritten before the
  // next navigation anyway.
  const clearPlanLimit = useCallback(() => {
    isShowing.current = false;
  }, []);

  useEffect(() => {
    setOnPlanLimitExceeded(showPlanLimit);
    return () => setOnPlanLimitExceeded(null);
  }, [showPlanLimit]);

  return (
    <PlanLimitContext.Provider value={{ payload, showPlanLimit, clearPlanLimit }}>
      {children}
    </PlanLimitContext.Provider>
  );
}

export const usePlanLimit = () => useContext(PlanLimitContext);
