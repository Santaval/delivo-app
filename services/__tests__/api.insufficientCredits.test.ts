import api, { setOnInsufficientCredits, setOnPlanLimitExceeded } from '@/services/api';

/** Makes the next request fail with `status` and `data`, without touching the network. */
const failWith = (status: number, data: unknown) => {
  api.defaults.adapter = async (config) => {
    const error: any = new Error(`Request failed with status code ${status}`);
    error.config = config;
    error.response = { status, data, config };
    throw error;
  };
};

const CREDITS_BODY = {
  code: 'INSUFFICIENT_CREDITS',
  balance: -5,
  overdraftFloor: -5,
  required: 1,
};

describe('api 402 insufficient credits interceptor', () => {
  const originalAdapter = api.defaults.adapter;
  const onCredits = jest.fn();
  const onPlanLimit = jest.fn();

  beforeEach(() => {
    onCredits.mockClear();
    onPlanLimit.mockClear();
    setOnInsufficientCredits(onCredits);
    setOnPlanLimitExceeded(onPlanLimit);
  });

  afterAll(() => {
    setOnInsufficientCredits(null);
    setOnPlanLimitExceeded(null);
    api.defaults.adapter = originalAdapter;
  });

  it('calls onInsufficientCredits once with the payload and still rejects', async () => {
    failWith(402, CREDITS_BODY);

    await expect(api.post('/orders', {})).rejects.toMatchObject({ response: { status: 402 } });
    expect(onCredits).toHaveBeenCalledTimes(1);
    expect(onCredits).toHaveBeenCalledWith(CREDITS_BODY);
    expect(onPlanLimit).not.toHaveBeenCalled();
  });

  it('falls back to the plan-limit handler for another 402 body', async () => {
    failWith(402, { code: 'PLAN_LIMIT_EXCEEDED', resource: 'products' });

    await expect(api.post('/products', {})).rejects.toBeDefined();
    expect(onCredits).not.toHaveBeenCalled();
    expect(onPlanLimit).toHaveBeenCalledTimes(1);
  });

  it('does not call it for non-402 statuses', async () => {
    failWith(400, CREDITS_BODY);

    await expect(api.post('/orders', {})).rejects.toBeDefined();
    expect(onCredits).not.toHaveBeenCalled();
  });
});
