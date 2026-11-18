import api from '@/services/api';
import CreditsService from '@/services/billing/Credits.service';

describe('CreditsService', () => {
  const originalAdapter = api.defaults.adapter;
  let captured: any;

  beforeEach(() => {
    captured = undefined;
    api.defaults.adapter = async (config) => {
      captured = config;
      return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config } as any;
    };
  });

  afterAll(() => {
    api.defaults.adapter = originalAdapter;
  });

  it('getCredits calls /billing/credits with an explicit company header', async () => {
    const data = await CreditsService.getCredits('company-9');
    expect(data).toEqual({ ok: true });
    expect(captured.url).toBe('/billing/credits');
    expect(captured.method).toBe('get');
    expect(captured.headers.get('x-company-id')).toBe('company-9');
  });

  it('getLedger sends page, pageSize and the company header', async () => {
    await CreditsService.getLedger('company-9', 3, 50);
    expect(captured.url).toBe('/billing/credits/ledger');
    expect(captured.params).toEqual({ page: 3, pageSize: 50 });
    expect(captured.headers.get('x-company-id')).toBe('company-9');
  });

  it('getLedger defaults pageSize to 20', async () => {
    await CreditsService.getLedger('company-9', 1);
    expect(captured.params).toEqual({ page: 1, pageSize: 20 });
  });
});
