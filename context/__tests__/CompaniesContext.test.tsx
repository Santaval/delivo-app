import { CompaniesProvider, useCompanies } from '@/context/CompaniesContext';
import { toast } from '@/context/ToastContext';
import api from '@/services/api';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import React from 'react';

const mockUseAuth = jest.fn();
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));
jest.mock('@/context/ToastContext', () => ({
  toast: { info: jest.fn(), success: jest.fn(), error: jest.fn() },
}));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const store: Record<string, string> = {};
const mockedStore = SecureStore as jest.Mocked<typeof SecureStore>;

const company = (id: string): Company => ({ id, name: `Empresa ${id}` }) as Company;
const authFor = (companies: Company[] | null) => ({
  user: companies ? ({ id: 'u1', companies } as User) : null,
  authState: { isLoading: false, authenticated: !!companies },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CompaniesProvider>{children}</CompaniesProvider>
);

describe('CompaniesContext — dropping the active company', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(store).forEach((k) => delete store[k]);
    delete api.defaults.headers.common['x-company-id'];
    mockedStore.getItemAsync.mockImplementation(async (k) => store[k] ?? null);
    mockedStore.setItemAsync.mockImplementation(async (k, v) => {
      store[k] = v;
    });
    mockedStore.deleteItemAsync.mockImplementation(async (k) => {
      delete store[k];
    });
  });

  it('resolves the stored company and sets the header', async () => {
    store.activeCompany = 'b';
    mockUseAuth.mockReturnValue(authFor([company('a'), company('b')]));

    const { result } = renderHook(() => useCompanies(), { wrapper });

    await waitFor(() => expect(result.current.activeCompany?.id).toBe('b'));
    expect(api.defaults.headers.common['x-company-id']).toBe('b');
    expect(result.current.isLoadingActiveCompany).toBe(false);
  });

  it('leaving the active company with others left: clears header + stored id and asks for a selection', async () => {
    store.activeCompany = 'a';
    mockUseAuth.mockReturnValue(authFor([company('a'), company('b')]));
    const { result, rerender } = renderHook(() => useCompanies(), { wrapper });
    await waitFor(() => expect(result.current.activeCompany?.id).toBe('a'));

    // refreshUser() after DELETE /members/me
    mockUseAuth.mockReturnValue(authFor([company('b')]));
    await act(async () => rerender({}));

    await waitFor(() => expect(result.current.activeCompany).toBeNull());
    expect(api.defaults.headers.common['x-company-id']).toBeUndefined();
    expect(store.activeCompany).toBeUndefined();
    expect(result.current.needsCompanySelection).toBe(true);
    expect(result.current.needsCompanyCreation).toBe(false);
  });

  it('leaving the only company: does not hang and asks for company creation', async () => {
    store.activeCompany = 'a';
    mockUseAuth.mockReturnValue(authFor([company('a')]));
    const { result, rerender } = renderHook(() => useCompanies(), { wrapper });
    await waitFor(() => expect(result.current.activeCompany?.id).toBe('a'));

    mockUseAuth.mockReturnValue(authFor([]));
    await act(async () => rerender({}));

    await waitFor(() => expect(result.current.activeCompany).toBeNull());
    expect(api.defaults.headers.common['x-company-id']).toBeUndefined();
    expect(store.activeCompany).toBeUndefined();
    expect(result.current.isLoadingActiveCompany).toBe(false);
    expect(result.current.companies).toEqual([]);
    expect(result.current.needsCompanyCreation).toBe(true);
  });

  it('leaving a non-active company keeps the active one', async () => {
    store.activeCompany = 'a';
    mockUseAuth.mockReturnValue(authFor([company('a'), company('b')]));
    const { result, rerender } = renderHook(() => useCompanies(), { wrapper });
    await waitFor(() => expect(result.current.activeCompany?.id).toBe('a'));

    mockUseAuth.mockReturnValue(authFor([company('a')]));
    await act(async () => rerender({}));

    await waitFor(() => expect(result.current.companies).toHaveLength(1));
    expect(result.current.activeCompany?.id).toBe('a');
    expect(api.defaults.headers.common['x-company-id']).toBe('a');
  });
});

describe('CompaniesContext — background refresh and "added to a company" toast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(store).forEach((k) => delete store[k]);
    delete api.defaults.headers.common['x-company-id'];
    mockedStore.getItemAsync.mockImplementation(async (k) => store[k] ?? null);
    mockedStore.setItemAsync.mockImplementation(async (k, v) => {
      store[k] = v;
    });
    mockedStore.deleteItemAsync.mockImplementation(async (k) => {
      delete store[k];
    });
  });

  it('does not toast on the first load', async () => {
    store.activeCompany = 'a';
    mockUseAuth.mockReturnValue(authFor([company('a'), company('b')]));
    const { result } = renderHook(() => useCompanies(), { wrapper });
    await waitFor(() => expect(result.current.activeCompany?.id).toBe('a'));
    expect(toast.info).not.toHaveBeenCalled();
  });

  it('toasts when a refresh brings a new company', async () => {
    store.activeCompany = 'a';
    mockUseAuth.mockReturnValue(authFor([company('a')]));
    const { result, rerender } = renderHook(() => useCompanies(), { wrapper });
    await waitFor(() => expect(result.current.activeCompany?.id).toBe('a'));

    mockUseAuth.mockReturnValue(authFor([company('a'), company('b')]));
    await act(async () => rerender({}));

    await waitFor(() => expect(toast.info).toHaveBeenCalledTimes(1));
    expect((toast.info as jest.Mock).mock.calls[0][0]).toContain('Empresa b');
  });

  it('does not toast for a company this device just created and selected', async () => {
    mockUseAuth.mockReturnValue(authFor([]));
    const { result, rerender } = renderHook(() => useCompanies(), { wrapper });
    await waitFor(() => expect(result.current.isLoadingActiveCompany).toBe(false));
    // A different user object, still with no companies: arms the baseline
    mockUseAuth.mockReturnValue(authFor([]));
    await act(async () => rerender({}));

    await act(async () => {
      await result.current.selectCompany('new');
    });
    mockUseAuth.mockReturnValue(authFor([company('new')]));
    await act(async () => rerender({}));

    await waitFor(() => expect(result.current.activeCompany?.id).toBe('new'));
    expect(toast.info).not.toHaveBeenCalled();
  });

  it('a background refresh keeps the app out of the loading state and keeps the same activeCompany object', async () => {
    store.activeCompany = 'a';
    mockUseAuth.mockReturnValue(authFor([company('a'), company('b')]));
    const { result, rerender } = renderHook(() => useCompanies(), { wrapper });
    await waitFor(() => expect(result.current.activeCompany?.id).toBe('a'));
    const before = result.current.activeCompany;

    const seen: boolean[] = [];
    mockUseAuth.mockReturnValue(authFor([company('a'), company('b')]));
    await act(async () => rerender({}));
    seen.push(result.current.isLoadingActiveCompany);

    expect(seen).toEqual([false]);
    expect(result.current.activeCompany).toBe(before);
  });
});

