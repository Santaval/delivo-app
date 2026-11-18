/**
 * Payload the API returns alongside a 402 when the company has no bills (credits) left.
 * Numbers are nullable so the UI still works if the backend omits them.
 */
export type InsufficientCreditsPayload = {
  code: 'INSUFFICIENT_CREDITS';
  balance: number | null;
  overdraftFloor: number | null;
  required: number | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Candidate locations for the payload. Depending on how the backend's
 * exception filter serializes the error, the object may sit at the root of
 * the body or be nested under one of these keys.
 */
const unwrap = (data: unknown): Record<string, unknown>[] => {
  if (!isRecord(data)) return [];
  return [data, data.error, data.details, data.message].filter(isRecord);
};

/**
 * Extracts the insufficient-credits payload from a 402 response body.
 * Matches only `code === "INSUFFICIENT_CREDITS"`; any other body returns null.
 */
export const parseInsufficientCreditsPayload = (
  data: unknown,
): InsufficientCreditsPayload | null => {
  for (const candidate of unwrap(data)) {
    if (candidate.code !== 'INSUFFICIENT_CREDITS') continue;
    return {
      code: 'INSUFFICIENT_CREDITS',
      balance: asNumber(candidate.balance),
      overdraftFloor: asNumber(candidate.overdraftFloor),
      required: asNumber(candidate.required),
    };
  }
  return null;
};

/** True for an axios-style error whose response is a 402 INSUFFICIENT_CREDITS. */
export const isInsufficientCreditsError = (error: unknown): boolean => {
  const response = (error as { response?: { status?: unknown; data?: unknown } } | null)?.response;
  return response?.status === 402 && parseInsufficientCreditsPayload(response.data) !== null;
};
