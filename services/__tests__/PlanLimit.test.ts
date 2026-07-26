import { parsePlanLimitPayload } from '@/services/errors/PlanLimit';

const FULL = {
  code: 'PLAN_LIMIT_EXCEEDED',
  resource: 'products',
  limit: 50,
  used: 50,
  tier: 'Free',
  upgradeTo: 'arranque',
};

describe('parsePlanLimitPayload', () => {
  it('parses a flat body', () => {
    expect(parsePlanLimitPayload(FULL)).toEqual(FULL);
  });

  it('parses a body nested under "error"', () => {
    expect(parsePlanLimitPayload({ statusCode: 402, error: FULL })).toEqual(FULL);
  });

  it('parses a body nested under "details"', () => {
    expect(parsePlanLimitPayload({ statusCode: 402, details: FULL })).toEqual(FULL);
  });

  it('parses a body nested under an object "message"', () => {
    expect(parsePlanLimitPayload({ statusCode: 402, message: FULL })).toEqual(FULL);
  });

  it('coerces numeric strings for limit and used', () => {
    const parsed = parsePlanLimitPayload({ ...FULL, limit: '50', used: '48' });
    expect(parsed).toMatchObject({ limit: 50, used: 48 });
  });

  it('nulls out missing or unparseable counts and optional fields', () => {
    const parsed = parsePlanLimitPayload({ code: 'PLAN_LIMIT_EXCEEDED', resource: 'orders' });

    expect(parsed).toEqual({
      code: 'PLAN_LIMIT_EXCEEDED',
      resource: 'orders',
      limit: null,
      used: null,
      tier: null,
      upgradeTo: null,
    });
  });

  it('accepts a payload identified by resource alone', () => {
    expect(parsePlanLimitPayload({ resource: 'clients' })).toMatchObject({
      code: 'PLAN_LIMIT_EXCEEDED',
      resource: 'clients',
    });
  });

  it('returns null for bodies that are not plan-limit payloads', () => {
    expect(parsePlanLimitPayload(undefined)).toBeNull();
    expect(parsePlanLimitPayload(null)).toBeNull();
    expect(parsePlanLimitPayload('Payment Required')).toBeNull();
    expect(parsePlanLimitPayload([FULL])).toBeNull();
    expect(parsePlanLimitPayload({ statusCode: 402, message: 'Payment Required' })).toBeNull();
  });
});
