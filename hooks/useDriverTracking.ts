import { useCompanies } from "@/context/CompaniesContext";
import { toast } from "@/context/ToastContext";
import { requestPermissionWithRationale } from "@/hooks/useUserLocation";
import i18n from "@/i18n";
import {
  LOCATION_TASK_NAME,
  type TrackingSession,
} from "@/services/tracking/LocationTracking.core";
import {
  readSession,
  writeSession,
} from "@/services/tracking/LocationTracking.storage";
import { reportLocations, stopTracking } from "@/services/tracking/LocationTracking.task";
import * as Location from "expo-location";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";

export type TrackingMode = "off" | "background" | "foreground";

export interface DriverTracking {
  /** How the position is being shared right now. */
  mode: TrackingMode;
  /** The driver paused sharing (the route stays associated). */
  paused: boolean;
  /** Starts sharing the position for `routeId` (asks for permissions if needed). */
  start: (routeId: string) => Promise<boolean>;
  /**
   * Stops sharing and forgets the route (route completed / reassigned). With
   * `routeId` it only acts if that is the route being tracked, so opening some
   * other route never cuts off the one the user is driving.
   */
  stop: (routeId?: string) => Promise<void>;
  /** Stops sharing but remembers the pause, so it is not resumed automatically. */
  pause: () => Promise<void>;
  /** Resumes after a pause. */
  resume: () => Promise<void>;
}

const noop = async () => {};
const DEFAULT: DriverTracking = {
  mode: "off",
  paused: false,
  start: async () => false,
  stop: noop,
  pause: noop,
  resume: noop,
};

export const DriverTrackingContext = createContext<DriverTracking>(DEFAULT);

/** Tracking state of the route screen (provided by `RouteScreenManager`). */
export const useDriverTrackingContext = () => useContext(DriverTrackingContext);

/**
 * Background permission ("Allow all the time"), asked only after the foreground
 * one, behind an in-app rationale (required by Google Play / App Review).
 */
const requestBackgroundPermission = async (): Promise<boolean> => {
  const current = await Location.getBackgroundPermissionsAsync();
  if (current.status === "granted") return true;
  if (!current.canAskAgain) return false;

  const proceed = await new Promise<boolean>((resolve) => {
    Alert.alert(
      i18n.t("trackingBackgroundRationaleTitle"),
      i18n.t("trackingBackgroundRationaleMessage"),
      [
        { text: i18n.t("cancel"), style: "cancel", onPress: () => resolve(false) },
        { text: i18n.t("continueLabel"), onPress: () => resolve(true) },
      ],
      { cancelable: false },
    );
  });
  if (!proceed) return false;
  const { status } = await Location.requestBackgroundPermissionsAsync();
  return status === "granted";
};

const startBackgroundUpdates = () =>
  Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 10_000,
    distanceInterval: 25,
    // Keeps the updates coming when the app is backgrounded (Android)
    foregroundService: {
      notificationTitle: i18n.t("trackingNotificationTitle"),
      notificationBody: i18n.t("trackingNotificationBody"),
    },
    // Blue status-bar pill while tracking in the background (iOS)
    showsBackgroundLocationIndicator: true,
    pausesUpdatesAutomatically: false,
  });

/**
 * Driver side of the live location: `start(routeId)` / `stop()`.
 *
 * - Background: `startLocationUpdatesAsync` + the headless task in
 *   `services/tracking/LocationTracking.task.ts`.
 * - If "Allow all the time" is denied, it falls back to `watchPositionAsync`
 *   (foreground only) and tells the user.
 */
const useDriverTracking = (): DriverTracking => {
  const { activeCompany } = useCompanies();
  const companyId = activeCompany?.id ?? null;
  const [mode, setMode] = useState<TrackingMode>("off");
  const [paused, setPaused] = useState(false);
  const watcher = useRef<Location.LocationSubscription | null>(null);
  const busy = useRef(false);
  const mounted = useRef(true);

  const removeWatcher = useCallback(() => {
    watcher.current?.remove();
    watcher.current = null;
  }, []);

  const safeSet = useCallback(<T>(setter: (v: T) => void, value: T) => {
    if (mounted.current) setter(value);
  }, []);

  const begin = useCallback(
    async (session: TrackingSession): Promise<boolean> => {
      if (Platform.OS === "web") return false;
      if (!(await requestPermissionWithRationale())) {
        toast.error(i18n.t("trackingPermissionDenied"));
        return false;
      }
      const background = await requestBackgroundPermission();
      await writeSession({ ...session, paused: false });
      removeWatcher();

      if (background) {
        if (!(await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME))) {
          await startBackgroundUpdates();
        }
        safeSet(setMode, "background");
      } else {
        // The tracking only works while the app is open
        watcher.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 10_000,
            distanceInterval: 25,
          },
          (location) => {
            reportLocations([location]);
          },
        );
        safeSet(setMode, "foreground");
        toast.info(i18n.t("trackingForegroundOnly"));
      }
      safeSet(setPaused, false);
      return true;
    },
    [removeWatcher, safeSet],
  );

  const start = useCallback(
    async (routeId: string) => {
      if (busy.current) return false;
      busy.current = true;
      try {
        const existing = await readSession();
        // Respect a pause the driver chose for this route (also across restarts)
        if (existing?.routeId === routeId && existing.paused) {
          safeSet(setPaused, true);
          return false;
        }
        if (
          existing?.routeId === routeId &&
          (await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).catch(() => false))
        ) {
          safeSet(setMode, "background");
          return true;
        }
        return await begin({ routeId, companyId });
      } catch (error) {
        console.error("Failed to start location tracking:", error);
        return false;
      } finally {
        busy.current = false;
      }
    },
    [begin, companyId, safeSet],
  );

  const stop = useCallback(async (routeId?: string) => {
    if (routeId) {
      const session = await readSession();
      if (session?.routeId !== routeId) return;
    }
    removeWatcher();
    try {
      await stopTracking();
    } catch (error) {
      console.error("Failed to stop location tracking:", error);
    }
    safeSet(setMode, "off");
    safeSet(setPaused, false);
  }, [removeWatcher, safeSet]);

  const pause = useCallback(async () => {
    const session = await readSession();
    removeWatcher();
    try {
      if (await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME)) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
    } catch {
      // already stopped
    }
    if (session) await writeSession({ ...session, paused: true });
    safeSet(setMode, "off");
    safeSet(setPaused, true);
  }, [removeWatcher, safeSet]);

  const resume = useCallback(async () => {
    const session = await readSession();
    if (!session) return;
    safeSet(setPaused, false);
    await writeSession({ ...session, paused: false });
    await start(session.routeId);
  }, [safeSet, start]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      // The OS-level task keeps running on purpose; only the foreground watcher dies with the screen
      watcher.current?.remove();
      watcher.current = null;
    };
  }, []);

  return { mode, paused, start, stop, pause, resume };
};

export default useDriverTracking;
