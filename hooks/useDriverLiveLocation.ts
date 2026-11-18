import api from "@/services/api";
import RoutesService from "@/services/routes/Routes.service";
import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import EventSource from "react-native-sse";

export const BACKOFF_BASE_MS = 1_000;
export const BACKOFF_MAX_MS = 30_000;
/** After this many consecutive failed connections the stream is given up for polling. */
export const MAX_STREAM_FAILURES = 3;
export const POLL_INTERVAL_MS = 15_000;

/** Exponential backoff: 1s, 2s, 4s ... capped at 30s. `attempt` starts at 1. */
export const backoffDelay = (attempt: number) =>
  Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * 2 ** Math.max(0, attempt - 1));

type StreamEvent = "location" | "cleared" | "finished";

const parseLocation = (raw: string | null | undefined): RouteDriverLocation | null => {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    return data && typeof data.lat === "number" && typeof data.lng === "number" ? data : null;
  } catch {
    return null;
  }
};

/** Authorization and company headers are set on the shared axios instance by the contexts. */
const authHeaders = (): Record<string, string> => {
  const common = api.defaults.headers.common as Record<string, unknown>;
  const headers: Record<string, string> = {};
  if (typeof common["Authorization"] === "string") headers.Authorization = common["Authorization"];
  if (typeof common["x-company-id"] === "string") headers["x-company-id"] = common["x-company-id"];
  return headers;
};

export type LiveLocationMode = "idle" | "stream" | "polling";

/**
 * Live position of a route's driver, for OWNER/ADMIN. Pass `enabled: false` for
 * everyone else (or when the route is not STARTED): nothing is opened then.
 *
 * - Starts from `initial` (`route.driverLocation`).
 * - SSE stream `GET /routes/:id/location/stream` (`location`, `cleared`, `finished`),
 *   reconnecting with exponential backoff; `finished` closes it for good.
 * - After `MAX_STREAM_FAILURES` consecutive failures it polls
 *   `GET /routes/:id/location` every 15 s.
 * - Closed while the app is in the background, reopened when it is active again.
 */
const useDriverLiveLocation = (
  routeId: string | undefined,
  options: { enabled: boolean; initial?: RouteDriverLocation | null },
) => {
  const { enabled, initial } = options;
  const [location, setLocation] = useState<RouteDriverLocation | null>(initial ?? null);
  const [mode, setMode] = useState<LiveLocationMode>("idle");
  const [appActive, setAppActive] = useState(AppState.currentState !== "background");
  const initialRef = useRef(initial);
  initialRef.current = initial;

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      setAppActive(state === "active");
    });
    return () => sub.remove();
  }, []);

  // A new route (or a refreshed route payload) resets the starting point
  useEffect(() => {
    setLocation(initial ?? null);
  }, [routeId, initial?.recordedAt, initial?.lat, initial?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!routeId || !enabled || !appActive) {
      setMode("idle");
      return;
    }

    let disposed = false;
    let failures = 0;
    let source: EventSource<StreamEvent> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const closeSource = () => {
      if (!source) return;
      source.removeAllEventListeners();
      source.close();
      source = null;
    };

    const stopAll = () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (pollTimer) clearInterval(pollTimer);
      closeSource();
    };

    const poll = async () => {
      try {
        const latest = await RoutesService.getDriverLocation(routeId);
        if (!disposed) setLocation(latest);
      } catch (error: any) {
        const status = error?.response?.status;
        // No access / route gone: polling again will not help
        if (status === 403 || status === 404) {
          stopAll();
          setMode("idle");
        }
      }
    };

    const startPolling = () => {
      closeSource();
      setMode("polling");
      poll();
      pollTimer = setInterval(poll, POLL_INTERVAL_MS);
    };

    const onFailure = (status?: number) => {
      closeSource();
      if (disposed) return;
      if (status === 401 || status === 403 || status === 404) {
        // Not allowed to watch this route (or session expired): do not hammer the API
        stopAll();
        setMode("idle");
        return;
      }
      failures += 1;
      if (failures >= MAX_STREAM_FAILURES) {
        startPolling();
        return;
      }
      reconnectTimer = setTimeout(connect, backoffDelay(failures));
    };

    function connect() {
      if (disposed) return;
      const baseUrl = String(api.defaults.baseURL ?? "").replace(/\/$/, "");
      // pollingInterval 0: reconnection is handled here, with backoff
      const es = new EventSource<StreamEvent>(`${baseUrl}/routes/${routeId}/location/stream`, {
        headers: authHeaders(),
        pollingInterval: 0,
        timeoutBeforeConnection: 0,
      });
      source = es;
      setMode("stream");

      es.addEventListener("open", () => {
        failures = 0;
      });
      es.addEventListener("location", (event) => {
        failures = 0;
        const next = parseLocation(event.data);
        if (next) setLocation(next);
      });
      es.addEventListener("cleared", () => {
        setLocation(null);
      });
      es.addEventListener("finished", () => {
        // The server closes the stream: reconnecting would be pointless
        setLocation(null);
        stopAll();
        setMode("idle");
      });
      es.addEventListener("error", (event) => {
        onFailure((event as { xhrStatus?: number }).xhrStatus);
      });
      es.addEventListener("close", () => {
        // The server ended the stream without `finished` (deploy, proxy timeout)
        if (source === es) onFailure();
      });
    }

    connect();
    return () => {
      stopAll();
    };
  }, [routeId, enabled, appActive]);

  return { location: enabled ? location : null, mode };
};

export default useDriverLiveLocation;
