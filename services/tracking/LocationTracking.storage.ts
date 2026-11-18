import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TrackingSession } from "./LocationTracking.core";

/**
 * The background task runs outside the React tree, so everything it needs lives
 * in storage. The JWT is NOT copied: the task reads the same SecureStore entry
 * AuthContext writes ("token"), so logging out (which deletes it) also cuts the
 * task off, and a re-login is picked up automatically.
 */
export const TOKEN_KEY = "token";
const SESSION_KEY = "driverTracking.session";
const BUFFER_KEY = "driverTracking.buffer";

export const readSession = async (): Promise<TrackingSession | null> => {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.routeId === "string" ? (parsed as TrackingSession) : null;
  } catch {
    return null;
  }
};

export const writeSession = (session: TrackingSession) =>
  AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

export const readBuffer = async (): Promise<DriverLocationPoint[]> => {
  try {
    const raw = await AsyncStorage.getItem(BUFFER_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeBuffer = (points: DriverLocationPoint[]) =>
  points.length === 0
    ? AsyncStorage.removeItem(BUFFER_KEY)
    : AsyncStorage.setItem(BUFFER_KEY, JSON.stringify(points));

export const clearTrackingStorage = () =>
  AsyncStorage.multiRemove([SESSION_KEY, BUFFER_KEY]);
