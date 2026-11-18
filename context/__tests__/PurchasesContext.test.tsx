import { PurchasesProvider, usePurchases } from '@/context/PurchasesContext';
import RevenueCatService from '@/services/purchases/RevenueCat.service';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

const mockUseCompanies = jest.fn();
jest.mock('@/context/CompaniesContext', () => ({
  useCompanies: () => mockUseCompanies(),
}));
jest.mock('@/services/purchases/RevenueCat.service', () => ({
  __esModule: true,
  default: {
    identify: jest.fn(),
    getCreditsOffering: jest.fn(),
    currentAppUserId: jest.fn(),
    purchasePackage: jest.fn(),
  },
}));

const svc = RevenueCatService as jest.Mocked<typeof RevenueCatService>;

const deferred = <T,>() => {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PurchasesProvider>{children}</PurchasesProvider>
);

let company: { id: string } | null;

describe('PurchasesContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    company = { id: 'a' };
    mockUseCompanies.mockImplementation(() => ({ activeCompany: company, isLoadingActiveCompany: false }));
    svc.identify.mockResolvedValue(undefined);
    svc.getCreditsOffering.mockResolvedValue({ identifier: 'delivo_credits' } as any);
    svc.currentAppUserId.mockResolvedValue('a');
    svc.purchasePackage.mockResolvedValue(undefined);
  });

  it('does not touch the SDK without an active company', async () => {
    company = null;
    const { result } = renderHook(() => usePurchases(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isIdentityReady).toBe(false);
    expect(result.current.identityCompanyId).toBeNull();
    expect(result.current.creditsOffering).toBeNull();
    expect(svc.identify).not.toHaveBeenCalled();
    expect(svc.getCreditsOffering).not.toHaveBeenCalled();
  });

  it('identifies then becomes ready with the active company', async () => {
    const { result } = renderHook(() => usePurchases(), { wrapper });
    await waitFor(() => expect(result.current.isIdentityReady).toBe(true));
    expect(svc.identify).toHaveBeenCalledWith('a');
    expect(result.current.identityCompanyId).toBe('a');
    expect(result.current.creditsOffering).not.toBeNull();
  });

  it('is not ready while switching company and ignores a stale identify', async () => {
    const first = deferred<void>();
    const second = deferred<void>();
    svc.identify.mockImplementationOnce(() => first.promise).mockImplementationOnce(() => second.promise);
    const { result, rerender } = renderHook(() => usePurchases(), { wrapper });
    company = { id: 'b' };
    rerender({});
    await act(async () => {
      first.resolve();
    });
    expect(result.current.isIdentityReady).toBe(false);
    expect(result.current.identityCompanyId).toBeNull();
    await act(async () => {
      second.resolve();
    });
    await waitFor(() => expect(result.current.isIdentityReady).toBe(true));
    expect(result.current.identityCompanyId).toBe('b');
    expect(svc.identify).toHaveBeenNthCalledWith(2, 'b');
  });

  it('purchaseCredits succeeds when the SDK user matches', async () => {
    const { result } = renderHook(() => usePurchases(), { wrapper });
    await waitFor(() => expect(result.current.isIdentityReady).toBe(true));
    let r: string | undefined;
    await act(async () => {
      r = await result.current.purchaseCredits({} as any);
    });
    expect(r).toBe('purchased');
  });

  it('purchaseCredits returns error when the SDK user differs from the active company', async () => {
    svc.currentAppUserId.mockResolvedValue('other');
    const { result } = renderHook(() => usePurchases(), { wrapper });
    await waitFor(() => expect(result.current.isIdentityReady).toBe(true));
    let r: string | undefined;
    await act(async () => {
      r = await result.current.purchaseCredits({} as any);
    });
    expect(r).toBe('error');
    expect(svc.purchasePackage).not.toHaveBeenCalled();
  });
});
