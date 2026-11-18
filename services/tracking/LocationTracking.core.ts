/**
 * Pure logic of the driver location tracking. It has no native imports so it can
 * run (and be tested) anywhere: the headless background task and the foreground
 * fallback both feed it through `processLocations`, injecting the real storage,
 * network and "stop" side effects.
 */

export const LOCATION_TASK_NAME = "delivo-driver-location-tracking";

/** Points kept while offline. The API only uses the most recent one. */
export const MAX_BUFFERED_POINTS = 20;
/** The API accepts 1..50 points per request. */
export const MAX_POINTS_PER_REQUEST = 50;

/** What the task needs to remember about the route being tracked (it runs outside the React tree). */
export interface TrackingSession {
  routeId: string;
  companyId: string | null;
  /** The driver paused sharing: the route stays associated but nothing is sent. */
  paused?: boolean;
}

/** Subset of `expo-location`'s `LocationObject` used here. */
export interface RawLocation {
  coords: {
    latitude: number;
    longitude: number;
    heading?: number | null;
    speed?: number | null;
    accuracy?: number | null;
  };
  /** Epoch ms */
  timestamp: number;
}

/** iOS reports -1 for unknown heading/speed/accuracy; so can NaN. The API wants null. */
const toNullable = (value: number | null | undefined): number | null =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;

export const buildPoint = (location: RawLocation): DriverLocationPoint => {
  const heading = toNullable(location.coords.heading);
  return {
    lat: location.coords.latitude,
    lng: location.coords.longitude,
    // Valid range is 0..360
    heading: heading !== null && heading <= 360 ? heading : null,
    speed: toNullable(location.coords.speed),
    accuracy: toNullable(location.coords.accuracy),
    recordedAt: new Date(location.timestamp).toISOString(),
  };
};

const isValidPoint = (p: DriverLocationPoint) =>
  Number.isFinite(p.lat) &&
  Number.isFinite(p.lng) &&
  Math.abs(p.lat) <= 90 &&
  Math.abs(p.lng) <= 180 &&
  !Number.isNaN(Date.parse(p.recordedAt));

/**
 * Builds the next batch: buffered points followed by the new ones, ordered by
 * time, de-duplicated, invalid ones dropped, capped to the most recent
 * `MAX_BUFFERED_POINTS`.
 */
export const mergePoints = (
  buffered: DriverLocationPoint[],
  incoming: DriverLocationPoint[],
  max: number = MAX_BUFFERED_POINTS,
): DriverLocationPoint[] => {
  const seen = new Set<string>();
  const merged = [...buffered, ...incoming]
    .filter(isValidPoint)
    .filter((p) => {
      const key = `${p.recordedAt}|${p.lat}|${p.lng}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt));
  return merged.slice(-Math.min(max, MAX_POINTS_PER_REQUEST));
};

export type ReportOutcome =
  /** Delivered: drop the buffer. */
  | "sent"
  /** Route finished, reassigned, missing, or the session is gone: stop tracking. */
  | "stop"
  /** Transient (offline, 429, 5xx, 401): keep the buffer for the next attempt. */
  | "retry"
  /** The server rejected the payload (400): drop it, keep tracking. */
  | "drop";

/** Maps an HTTP status (0 / undefined = no response) to what the task must do. */
export const classifyStatus = (status: number | undefined): ReportOutcome => {
  if (status === undefined || status === 0) return "retry";
  if (status >= 200 && status < 300) return "sent";
  // 403: no longer the driver; 404: route gone; 409: route not STARTED anymore
  if (status === 403 || status === 404 || status === 409) return "stop";
  if (status === 400) return "drop";
  return "retry";
};

export interface TrackingDeps {
  readSession: () => Promise<TrackingSession | null>;
  readBuffer: () => Promise<DriverLocationPoint[]>;
  writeBuffer: (points: DriverLocationPoint[]) => Promise<void>;
  /** Returns the HTTP status, or `undefined` when there was no response (offline). */
  send: (session: TrackingSession, points: DriverLocationPoint[]) => Promise<number | undefined>;
  /** Stops the location updates and forgets the session and buffer. */
  stop: () => Promise<void>;
}

/**
 * Handles one batch of locations delivered by the task (or the foreground
 * watcher). Never throws: a headless task must not crash on a failed request.
 */
export const processLocations = async (
  locations: RawLocation[],
  deps: TrackingDeps,
): Promise<ReportOutcome | "no-session" | "paused" | "empty"> => {
  try {
    const session = await deps.readSession();
    if (!session) {
      // Updates are still running but there is nothing to report to
      await deps.stop();
      return "no-session";
    }
    if (session.paused) return "paused";

    const incoming = locations.map(buildPoint);
    const buffered = await deps.readBuffer();
    const batch = mergePoints(buffered, incoming);
    if (batch.length === 0) return "empty";

    const outcome = classifyStatus(await deps.send(session, batch));
    switch (outcome) {
      case "sent":
      case "drop":
        await deps.writeBuffer([]);
        break;
      case "stop":
        await deps.stop();
        break;
      case "retry":
        await deps.writeBuffer(batch);
        break;
    }
    return outcome;
  } catch {
    return "retry";
  }
};
