import { act, renderHook, waitFor } from '@testing-library/react-native';
import useBills from '@/hooks/useBills';
import BillsService from '@/services/orders/Bills.service';
import { toast } from '@/context/ToastContext';

jest.mock('@/services/orders/Bills.service');
jest.mock('@/context/ToastContext', () => ({
  toast: { error: jest.fn(), success: jest.fn(), info: jest.fn() },
}));

const mockedBillsService = BillsService as jest.Mocked<typeof BillsService>;

const buildBill = (id: string, overrides: Partial<Order> = {}): Order => ({
  id,
  client: { id: 'client-1', name: 'Soda La Esquina' } as Client,
  number: Number(id.replace(/\D/g, '')) || 1,
  pricing: { subtotal: 1000, ivaTotal: 130, total: 1130 },
  items: [],
  status: 'PENDING',
  paid: 0,
  deliveryStatus: 'DELIVERED',
  createdAt: '2026-06-01T10:00:00.000Z',
  updatedAt: '2026-06-01T10:00:00.000Z',
  ...overrides,
});

const counts: BillsCounts = { ALL: 3, PENDING: 2, PAID: 1, CANCELLED: 0 };

const buildPage = (data: Order[], page: number, hasNextPage: boolean): BillsPage => ({
  data,
  pagination: { page, pageSize: 20, total: 99, totalPages: hasNextPage ? page + 1 : page, hasNextPage },
  counts,
});

/** A promise the test resolves by hand, to control response ordering. */
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
};

describe('useBills', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads the first page of PENDING bills by default', async () => {
    mockedBillsService.page.mockResolvedValueOnce(buildPage([buildBill('b1')], 1, false));

    const { result } = renderHook(() => useBills());

    expect(result.current.status).toBe('PENDING');
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockedBillsService.page).toHaveBeenCalledWith({
      page: 1, pageSize: 20, status: 'PENDING', search: '',
    });
    expect(result.current.bills.map((b) => b.id)).toEqual(['b1']);
    expect(result.current.counts).toEqual(counts);
  });

  it('appends the next page and skips bills already in the list', async () => {
    mockedBillsService.page
      .mockResolvedValueOnce(buildPage([buildBill('b1'), buildBill('b2')], 1, true))
      .mockResolvedValueOnce(buildPage([buildBill('b2'), buildBill('b3')], 2, false));

    const { result } = renderHook(() => useBills());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { result.current.loadMore(); });
    await waitFor(() => expect(result.current.loadingMore).toBe(false));

    expect(mockedBillsService.page).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
    expect(result.current.bills.map((b) => b.id)).toEqual(['b1', 'b2', 'b3']);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('does not request another page when there is none', async () => {
    mockedBillsService.page.mockResolvedValueOnce(buildPage([buildBill('b1')], 1, false));

    const { result } = renderHook(() => useBills());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.loadMore(); });

    expect(mockedBillsService.page).toHaveBeenCalledTimes(1);
  });

  it('fires only one request when onEndReached triggers repeatedly', async () => {
    const next = deferred<BillsPage>();
    mockedBillsService.page
      .mockResolvedValueOnce(buildPage([buildBill('b1')], 1, true))
      .mockReturnValueOnce(next.promise);

    const { result } = renderHook(() => useBills());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.loadMore();
      result.current.loadMore();
      result.current.loadMore();
    });
    await act(async () => { next.resolve(buildPage([buildBill('b2')], 2, false)); });

    expect(mockedBillsService.page).toHaveBeenCalledTimes(2);
    expect(result.current.bills.map((b) => b.id)).toEqual(['b1', 'b2']);
  });

  it('resets to page 1 with the new filter when the status changes', async () => {
    mockedBillsService.page
      .mockResolvedValueOnce(buildPage([buildBill('b1')], 1, true))
      .mockResolvedValueOnce(buildPage([buildBill('b9', { status: 'PAID' })], 1, false));

    const { result } = renderHook(() => useBills());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.setStatus('PAID'); });
    await waitFor(() => expect(result.current.bills.map((b) => b.id)).toEqual(['b9']));

    expect(mockedBillsService.page).toHaveBeenLastCalledWith({
      page: 1, pageSize: 20, status: 'PAID', search: '',
    });
  });

  it('sends the trimmed search term and keeps the search callback stable', async () => {
    mockedBillsService.page.mockResolvedValue(buildPage([], 1, false));

    const { result } = renderHook(() => useBills());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const searchBefore = result.current.search;

    act(() => { result.current.search('  Ana  '); });
    await waitFor(() =>
      expect(mockedBillsService.page).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'Ana' })),
    );
    expect(result.current.search).toBe(searchBefore);
  });

  it('ignores a slow response for a filter the user already left', async () => {
    const slowPending = deferred<BillsPage>();
    mockedBillsService.page
      .mockReturnValueOnce(slowPending.promise)
      .mockResolvedValueOnce(buildPage([buildBill('paid1', { status: 'PAID' })], 1, false));

    const { result } = renderHook(() => useBills());

    act(() => { result.current.setStatus('PAID'); });
    await waitFor(() => expect(result.current.bills.map((b) => b.id)).toEqual(['paid1']));

    await act(async () => { slowPending.resolve(buildPage([buildBill('pending1')], 1, false)); });

    expect(result.current.bills.map((b) => b.id)).toEqual(['paid1']);
  });

  it('shows an error state when the first page fails, and a toast when a later page fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedBillsService.page.mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useBills());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();

    mockedBillsService.page
      .mockResolvedValueOnce(buildPage([buildBill('b1')], 1, true))
      .mockRejectedValueOnce(new Error('boom'));

    await act(async () => { await result.current.refresh(); });
    expect(result.current.error).toBeNull();

    await act(async () => { result.current.loadMore(); });
    await waitFor(() => expect(result.current.loadingMore).toBe(false));

    expect(toast.error).toHaveBeenCalled();
    expect(result.current.bills.map((b) => b.id)).toEqual(['b1']);
  });
});
