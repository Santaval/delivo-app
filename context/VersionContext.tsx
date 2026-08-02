import { getAppVersion } from "@/constants/version";
import VersionService from "@/services/version/Version.service";
import { isVersionSupported } from "@/utils/semver";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";

type VersionContextType = {
  /** True while the initial /version check is in flight. app/_layout.tsx
   *  folds this into its bootstrapping flag so the native splash stays up
   *  until the check resolves — no flash of `index` then redirect. */
  checking: boolean;
  /** True when the running frontend is older than the backend's declared
   *  minimum. app/_layout.tsx mounts the `force-update` screen, guarded
   *  on this flag, ahead of every other route group. */
  needsUpdate: boolean;
  /** Re-runs the check on demand — the force-update "Reintentar" button
   *  calls this so a freshly-shipped backend bump can clear the screen
   *  without an app restart. */
  recheck: () => void;
};

const VersionContext = createContext<VersionContextType>({
  checking: true,
  needsUpdate: false,
  recheck: () => {},
});

export function VersionProvider({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  // Guards against overlapping checks (initial run + a foreground resume
  // firing back-to-back) and against re-checking while a check is in flight.
  const inFlight = useRef(false);

  const runCheck = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setChecking(true);
    try {
      const minVersion = await VersionService.getMinVersion();
      console.log("Version check:", {
        minVersion,
        appVersion: getAppVersion(),
      });
      setNeedsUpdate(!isVersionSupported(getAppVersion(), minVersion));
    } catch {
      // Fail open: offline / 5xx / timeout must not brick the user.
      setNeedsUpdate(false);
    } finally {
      setChecking(false);
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    runCheck();
  }, [runCheck]);

  // Re-check when the app returns to the foreground — catches a backend bump
  // that lands while the app was backgrounded, without a cold restart.
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") runCheck();
      },
    );
    return () => subscription.remove();
  }, [runCheck]);

  return (
    <VersionContext.Provider
      value={{ checking, needsUpdate, recheck: runCheck }}
    >
      {children}
    </VersionContext.Provider>
  );
}

export const useVersion = () => useContext(VersionContext);
