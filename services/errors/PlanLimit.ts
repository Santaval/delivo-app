/**
 * Payload the API returns alongside a 402 when a plan quota is exceeded.
 * `limit`/`used`/`tier`/`upgradeTo` are optional in practice, so they are
 * nullable here and the UI falls back to a generic message without them.
 */
export type PlanLimitPayload = {
  code: string;
  resource: string;
  limit: number | null;
  used: number | null;
  tier: string | null;
  upgradeTo: string | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asString = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null;

const asNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Candidate locations for the payload. Depending on how the backend's
 * exception filter serializes an HttpException, the object may sit at the
 * root of the body or be nested under one of these keys.
 */
const unwrap = (data: unknown): Record<string, unknown>[] => {
  if (!isRecord(data)) return [];
  return [data, data.error, data.details, data.message].filter(isRecord);
};

/**
 * Extracts the plan-limit payload from a 402 response body.
 * Returns null when the body doesn't look like one, so callers can still
 * show a generic "limit reached" message.
 */
export const parsePlanLimitPayload = (data: unknown): PlanLimitPayload | null => {
  for (const candidate of unwrap(data)) {
    const code = asString(candidate.code);
    const resource = asString(candidate.resource);

    // Either field is enough to recognize the shape
    if (!code && !resource) continue;

    return {
      code: code ?? 'PLAN_LIMIT_EXCEEDED',
      resource: resource ?? '',
      limit: asNumber(candidate.limit),
      used: asNumber(candidate.used),
      tier: asString(candidate.tier),
      upgradeTo: asString(candidate.upgradeTo),
    };
  }

  return null;
};
