import config from "@/config/env";
import axios from "axios";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import * as TaskManager from "expo-task-manager";
import {
  LOCATION_TASK_NAME,
  processLocations,
  type RawLocation,
  type ReportOutcome,
  type TrackingDeps,
} from "./LocationTracking.core";
import {
  clearTrackingStorage,
  readBuffer,
  readSession,
  TOKEN_KEY,
  writeBuffer,
} from "./LocationTracking.storage";

export { LOCATION_TASK_NAME } from "./LocationTracking.core";

const REQUEST_TIMEOUT_MS = 15_000;

/** Stops the OS-level updates (if running) and forgets the session and buffer. */
export const stopTracking = async () => {
  try {
    if (await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME)) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
  } catch {
    // Task not registered / already stopped
  }
  await clearTrackingStorage();
};

/**
 * Real dependencies. The task can run headless (app killed or backgrounded), so
 * it never relies on the shared axios instance: its defaults (auth header,
 * company header, interceptors) are only set while the React tree is alive.
 */
const deps: TrackingDeps = {
  readSession,
  readBuffer,
  writeBuffer,
  stop: stopTracking,
  send: async (session, points) => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    // Logged out: nothing to authenticate with, and nobody to report as
    if (!token) return 403;
    try {
      const response = await axios.post(
        `${config.apiUrl}/routes/${session.routeId}/location`,
        { locations: points },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            ...(session.companyId ? { "x-company-id": session.companyId } : {}),
          },
          timeout: REQUEST_TIMEOUT_MS,
          validateStatus: () => true,
        },
      );
      return response.status;
    } catch {
      return undefined;
    }
  },
};

/** Shared by the background task and the foreground (`watchPositionAsync`) fallback. */
export const reportLocations = (
  locations: RawLocation[],
): Promise<ReportOutcome | "no-session" | "paused" | "empty"> =>
  processLocations(locations, deps);

// Registered at module level, as TaskManager requires: it must exist before the
// OS wakes the app headless. Imported for its side effect from app/_layout.tsx.
TaskManager.defineTask<{ locations: Location.LocationObject[] }>(
  LOCATION_TASK_NAME,
  async ({ data, error }) => {
    if (error || !data?.locations?.length) return;
    await reportLocations(data.locations);
  },
);
