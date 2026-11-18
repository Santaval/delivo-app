import { CreditsProvider, useCredits } from '@/context/CreditsContext';
import CreditsService from '@/services/billing/Credits.service';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { AppState } from 'react-native';

jest.mock('@/context/ToastContext', () => ({
  toast: { error: jest.fn(), info: jest.fn(), success: jest.fn() },
}));

const mockUseCompanies = jest.fn();
jest.mock('@/context/CompaniesContext', () => ({
  useCompanies: () => mockUseCompanies(),
}));
const mockUseCompanyMembers = jest.fn();
jest.mock('@/hooks/useCompanyMembers', () => ({
  __esModule: true,
  default: () => mockUseCompanyMembers(),
}));
jest.mock('@/services/billing/Credits.service', () => ({
  __esModule: true,
  default: { getCredits: jest.fn() },
}));

const mockedService = CreditsService as jest.Mocked<typeof CreditsService>;

const status = (balance: number): CreditsStatus => ({
  balance,
  overdraftFloor: -5,
  lowBalanceThreshold: 10,
  packs: [{ productId: 'delivo_bills_100', credits: 100 }],
});

const deferred = <T,>() => {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CreditsProvider>{children}</CreditsProvider>
);

let appStateHandler: ((s: string) => void) | undefined;
let company = { id: 'a' };

describe('CreditsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    company = { id: 'a' };
    mockUseCompanies.mockImplementation(() => ({ activeCompany: company }));
    mockUseCompanyMembers.mockReturnValue({ myRole: 'OWNER', loading: false });
    appStateHandler = undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation(((_: string, handler: any) => {
      appStateHandler = handler;
      return { remove: jest.fn() };
    }) as any);
  });
  afterEach(() => jest.restoreAllMocks());

  it.each([
    [37, false, false, false],
    [10, true, false, false],
    [-2, true, true, false],
    [-5, true, true, true],
  ])('derives flags at balance %i', async (balance, low, overdraft, blocked) => {
    mockedService.getCredits.mockResolvedValueOnce(status(balance));
    const { result } = renderHook(() => useCredits(), { wrapper });
    await waitFor(() => expect(result.current.balance).toBe(balance));
    expect(mockedService.getCredits).toHaveBeenCalledWith('a');
    expect(result.current.companyId).toBe('a');
    expect(result.current.isLow).toBe(low);
    expect(result.current.isInOverdraft).toBe(overdraft);
    expect(result.current.isBlocked).toBe(blocked);
    expect(result.current.packs).toHaveLength(1);
  });

  it('drops a stale response after switching company, and resets balance immediately', async () => {
    const a = deferred<CreditsStatus>();
    const b = deferred<CreditsStatus>();
    mockedService.getCredits.mockImplementation((cid: string) => (cid === 'a' ? a.promise : b.promise));

    const { result, rerender } = renderHook(() => useCredits(), { wrapper });
    expect(result.current.balance).toBeNull();

    company = { id: 'b' };
    rerender({});
    expect(result.current.balance).toBeNull();
    expect(mockedService.getCredits).toHaveBeenCalledWith('b');

    await act(async () => {
      b.resolve(status(7));
    });
    await waitFor(() => expect(result.current.balance).toBe(7));

    await act(async () => {
      a.resolve(status(99));
    });
    expect(result.current.balance).toBe(7);
    expect(result.current.companyId).toBe('b');
  });

  it('resets the balance to null as soon as the company changes', async () => {
    mockedService.getCredits.mockResolvedValueOnce(status(37));
    const { result, rerender } = renderHook(() => useCredits(), { wrapper });
    await waitFor(() => expect(result.current.balance).toBe(37));

    const b = deferred<CreditsStatus>();
    mockedService.getCredits.mockReturnValueOnce(b.promise);
    company = { id: 'b' };
    rerender({});
    expect(result.current.balance).toBeNull();
    expect(result.current.companyId).toBeNull();
    await act(async () => {
      b.resolve(status(3));
    });
    await waitFor(() => expect(result.current.balance).toBe(3));
  });

  it('noteBillIssued decrements optimistically, then the refetch replaces the value', async () => {
    mockedService.getCredits.mockResolvedValueOnce(status(37));
    const { result } = renderHook(() => useCredits(), { wrapper });
    await waitFor(() => expect(result.current.balance).toBe(37));

    const next = deferred<CreditsStatus>();
    mockedService.getCredits.mockReturnValueOnce(next.promise);
    act(() => result.current.noteBillIssued());
    expect(result.current.balance).toBe(36);

    await act(async () => {
      next.resolve(status(30));
    });
    await waitFor(() => expect(result.current.balance).toBe(30));
  });

  it('refetches when the app returns to the foreground', async () => {
    mockedService.getCredits.mockResolvedValue(status(5));
    const { result } = renderHook(() => useCredits(), { wrapper });
    await waitFor(() => expect(result.current.balance).toBe(5));
    expect(mockedService.getCredits).toHaveBeenCalledTimes(1);

    await act(async () => {
      appStateHandler?.('background');
      appStateHandler?.('active');
    });
    expect(mockedService.getCredits).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['OWNER', true],
    ['ADMIN', true],
    ['DEALER', false],
    [undefined, false],
  ])('canPurchase for role %s is %s', async (role, expected) => {
    mockUseCompanyMembers.mockReturnValue({ myRole: role, loading: false });
    mockedService.getCredits.mockResolvedValueOnce(status(5));
    const { result } = renderHook(() => useCredits(), { wrapper });
    await waitFor(() => expect(result.current.balance).toBe(5));
    expect(result.current.canPurchase).toBe(expected);
  });
});
