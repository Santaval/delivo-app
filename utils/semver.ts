/**
 * Compares two dot-separated numeric version strings. Returns true when
 * `current` is greater than or equal to `min` — i.e. the running frontend
 * is still supported by the backend's declared minimum.
 *
 * Only `major.minor.patch` numeric triples are considered. Any non-numeric
 * segment is treated as 0, and missing trailing segments default to 0, so
 * `"1.2"` is equivalent to `"1.2.0"`. Pre-release suffixes (e.g. `-rc.1`)
 * are ignored.
 *
 * Examples (min → current → result):
 *   "1.2.12" vs "1.2.12" → true
 *   "1.2.12" vs "1.2.13" → true
 *   "1.2.12" vs "1.2.11" → false
 *   "1.2.12" vs "1.1.14" → false
 */
export function isVersionSupported(current: string, min: string): boolean {
  const currentParts = parseVersion(current);
  const minParts = parseVersion(min);
  const len = Math.max(currentParts.length, minParts.length);

  for (let i = 0; i < len; i++) {
    const c = currentParts[i] ?? 0;
    const m = minParts[i] ?? 0;
    if (c > m) return true;
    if (c < m) return false;
  }
  return true;
}

function parseVersion(version: string): number[] {
  if (!version) return [0];
  const core = version.split('-')[0].split('+')[0];
  return core
    .split('.')
    .map((segment) => {
      const parsed = Number(segment);
      return Number.isFinite(parsed) && String(parsed) === segment.trim()
        ? parsed
        : 0;
    });
}