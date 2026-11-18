import { useCompanies } from '@/context/CompaniesContext';
import useCreditLedger from '@/hooks/useCreditLedger';
import CreditsService from '@/services/billing/Credits.service';
import { act, renderHook, waitFor } from '@testing-library/react-native';

jest.mock('@/context/CompaniesContext', () => ({ useCompanies: jest.fn() }));
jest.mock('@/context/ToastContext', () => ({
  toast: { info: jest.fn(), success: jest.fn(), error: jest.fn() },
}));
jest.mock('@/services/billing/Credits.service', () => ({
  __esModule: true,
  default: { getLedger: jest.fn() },
}));

const mockedService = CreditsService as jest.Mocked<typeof CreditsService>;
const mockedCompanies = useCompanies as jest.Mock;

const entry = (id: string): CreditLedgerEntry => ({
  id,
  reason: 'BILL_ISSUED',
  delta: -1,
  balanceAfter: 10,
  createdAt: '2026-01-01T00:00:00.000Z',
  billId: null,
  billNumber: null,
  productId: null,
  note: null,
});

const page = (ids: string[], p: number, hasNextPage: boolean): CreditLedgerPage => ({
  data: ids.map(entry),
  pagination: { page: p, pageSize: 20, total: 40, totalPages: 2, hasNextPage },
});

describe('useCreditLedger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedCompanies.mockReturnValue({ activeCompany: { id: 'c1' } });
  });

  it('loads the first page for the active company', async () => {
    mockedService.getLedger.mockResolvedValueOnce(page(['a', 'b'], 1, true));
    const { result } = renderHook(() => useCreditLedger());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockedService.getLedger).toHaveBeenCalledWith('c1', 1, 20);
    expect(result.current.entries.map((e) => e.id)).toEqual(['a', 'b']);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('loadMore appends the next page and skips duplicates', async () => {
    mockedService.getLedger
      .mockResolvedValueOnce(page(['a', 'b'], 1, true))
      .mockResolvedValueOnce(page(['b', 'c'], 2, false));
    const { result } = renderHook(() => useCreditLedger());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.loadMore();
    });
    await waitFor(() => expect(result.current.entries.map((e) => e.id)).toEqual(['a', 'b', 'c']));
    expect(mockedService.getLedger).toHaveBeenLastCalledWith('c1', 2, 20);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('does not load more without a next page', async () => {
    mockedService.getLedger.mockResolvedValueOnce(page(['a'], 1, false));
    const { result } = renderHook(() => useCreditLedger());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.loadMore();
    });
    expect(mockedService.getLedger).toHaveBeenCalledTimes(1);
  });
});
