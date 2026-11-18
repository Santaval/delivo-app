/** Helpers for the driver marker: staleness label and smooth movement. */

/** Older than this, the map shows "Last updated X min ago". */
export const STALE_AFTER_MS = 2 * 60_000;

/** Whole minutes elapsed since `recordedAt`, or `null` while it is still fresh (or invalid). */
export const staleMinutes = (recordedAt: string, now: number = Date.now()): number | null => {
  const recorded = Date.parse(recordedAt);
  if (Number.isNaN(recorded)) return null;
  const elapsed = now - recorded;
  return elapsed > STALE_AFTER_MS ? Math.floor(elapsed / 60_000) : null;
};

export interface Position {
  lat: number;
  lng: number;
  heading: number | null;
}

/** Signed shortest rotation from `from` to `to` in degrees, in (-180, 180]. */
export const shortestAngleDelta = (from: number, to: number) => {
  const delta = (((to - from) % 360) + 540) % 360 - 180;
  return delta === -180 ? 180 : delta;
};

/**
 * Position between `from` and `to` for `t` in [0, 1]. Heading follows the
 * shortest turn (359 -> 1 is 2 degrees, not 358); a missing heading keeps the other one.
 */
export const interpolatePosition = (from: Position, to: Position, t: number): Position => {
  const k = Math.min(1, Math.max(0, t));
  let heading: number | null;
  if (from.heading !== null && to.heading !== null) {
    heading = (from.heading + shortestAngleDelta(from.heading, to.heading) * k + 360) % 360;
  } else {
    heading = to.heading ?? from.heading;
  }
  return {
    lat: from.lat + (to.lat - from.lat) * k,
    lng: from.lng + (to.lng - from.lng) * k,
    heading,
  };
};

/** Up to two initials for the marker. */
export const initialsOf = (name?: string | null) =>
  (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("") || "?";
