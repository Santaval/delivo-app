import {
  isInsufficientCreditsError,
  parseInsufficientCreditsPayload,
} from '@/services/errors/InsufficientCredits';

const FULL = {
  code: 'INSUFFICIENT_CREDITS',
  balance: -5,
  overdraftFloor: -5,
  required: 1,
};

describe('parseInsufficientCreditsPayload', () => {
  it('parses a flat body', () => {
    expect(parseInsufficientCreditsPayload(FULL)).toEqual(FULL);
  });

  it.each(['error', 'details', 'message'])('parses a body nested under "%s"', (key) => {
    expect(parseInsufficientCreditsPayload({ statusCode: 402, [key]: FULL })).toEqual(FULL);
  });

  it('coerces numeric strings', () => {
    expect(
      parseInsufficientCreditsPayload({ ...FULL, balance: '-5', overdraftFloor: '-5', required: '1' }),
    ).toEqual(FULL);
  });

  it('nulls out missing numbers', () => {
    expect(parseInsufficientCreditsPayload({ code: 'INSUFFICIENT_CREDITS' })).toEqual({
      code: 'INSUFFICIENT_CREDITS',
      balance: null,
      overdraftFloor: null,
      required: null,
    });
  });

  it('returns null for a plan-limit body', () => {
    expect(
      parseInsufficientCreditsPayload({ code: 'PLAN_LIMIT_EXCEEDED', resource: 'products' }),
    ).toBeNull();
  });

  it('returns null for non-records, arrays and strings', () => {
    expect(parseInsufficientCreditsPayload(undefined)).toBeNull();
    expect(parseInsufficientCreditsPayload(null)).toBeNull();
    expect(parseInsufficientCreditsPayload('Payment Required')).toBeNull();
    expect(parseInsufficientCreditsPayload([FULL])).toBeNull();
    expect(parseInsufficientCreditsPayload({ statusCode: 402, message: 'Payment Required' })).toBeNull();
  });
});

describe('isInsufficientCreditsError', () => {
  it('is true for a 402 with the credits body', () => {
    expect(isInsufficientCreditsError({ response: { status: 402, data: FULL } })).toBe(true);
  });

  it('is false for another status, another body, or a non-axios error', () => {
    expect(isInsufficientCreditsError({ response: { status: 400, data: FULL } })).toBe(false);
    expect(isInsufficientCreditsError({ response: { status: 402, data: { code: 'PLAN_LIMIT_EXCEEDED' } } })).toBe(false);
    expect(isInsufficientCreditsError(new Error('boom'))).toBe(false);
    expect(isInsufficientCreditsError(null)).toBe(false);
    expect(isInsufficientCreditsError(undefined)).toBe(false);
  });
});
