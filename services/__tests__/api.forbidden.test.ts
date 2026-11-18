import api, { setOnForbidden } from '@/services/api';

/** Makes the next request fail with `status`, without touching the network. */
const failWith = (status: number) => {
  api.defaults.adapter = async (config) => {
    const error: any = new Error(`Request failed with status code ${status}`);
    error.config = config;
    error.response = { status, data: {}, config };
    throw error;
  };
};

describe('api 403 interceptor', () => {
  const originalAdapter = api.defaults.adapter;
  const handler = jest.fn();

  beforeEach(() => {
    handler.mockClear();
    setOnForbidden(handler);
    delete api.defaults.headers.common['x-company-id'];
  });

  afterAll(() => {
    setOnForbidden(null);
    api.defaults.adapter = originalAdapter;
  });

  it('notifies on a 403 for a company-scoped request, and still rejects', async () => {
    api.defaults.headers.common['x-company-id'] = 'company-1';
    failWith(403);

    await expect(api.get('/orders')).rejects.toMatchObject({ response: { status: 403 } });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not notify on a 403 without a company context', async () => {
    failWith(403);
    await expect(api.get('/something')).rejects.toBeDefined();
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not notify on other statuses', async () => {
    api.defaults.headers.common['x-company-id'] = 'company-1';
    failWith(404);
    await expect(api.get('/orders')).rejects.toBeDefined();
    expect(handler).not.toHaveBeenCalled();
  });
});
