import { AuthProvider, useAuth } from '@/context/AuthContext';
import AuthService from '@/services/auth/Auth.service';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import React from 'react';

jest.mock('@/context/ToastContext', () => ({
  toast: { info: jest.fn(), success: jest.fn(), error: jest.fn() },
}));
jest.mock('@/i18n', () => ({ t: (k: string) => k }));
jest.mock('expo-observe', () => ({ Observe: { markInteractive: jest.fn() } }));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
jest.mock('@/services/auth/Auth.service', () => ({
  __esModule: true,
  default: {
    googleAuth: jest.fn(),
    appleAuth: jest.fn(),
    qaLogin: jest.fn(),
    getUser: jest.fn(),
    deleteAccount: jest.fn(),
  },
}));

const mockedAuth = AuthService as jest.Mocked<typeof AuthService>;
const mockedStore = SecureStore as jest.Mocked<typeof SecureStore>;
const store: Record<string, string> = {};

const userA = { id: 'a', email: 'a@test.dev', companies: [] } as unknown as User;
const userB = { id: 'b', email: 'b@test.dev', companies: [] } as unknown as User;

const deferred = <T,>() => {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const signedInAsA = async () => {
  store.token = 'token-a';
  mockedAuth.getUser.mockResolvedValueOnce(userA);
  const hook = renderHook(() => useAuth(), { wrapper });
  await waitFor(() => expect(hook.result.current.user?.id).toBe('a'));
  return hook;
};

const switchToB = async (result: { current: ReturnType<typeof useAuth> }) => {
  await act(async () => {
    await result.current.logout();
  });
  mockedAuth.googleAuth.mockResolvedValueOnce({ token: 'token-b', user: userB });
  await act(async () => {
    await result.current.googleAuth('google-id-token');
  });
  expect(result.current.user?.id).toBe('b');
};

describe('AuthContext — switching accounts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(store).forEach((k) => delete store[k]);
    mockedStore.getItemAsync.mockImplementation(async (k) => store[k] ?? null);
    mockedStore.setItemAsync.mockImplementation(async (k, v) => {
      store[k] = v;
    });
    mockedStore.deleteItemAsync.mockImplementation(async (k) => {
      delete store[k];
    });
  });

  it('a background sync started as user A does not overwrite user B', async () => {
    const { result } = await signedInAsA();

    const pending = deferred<User>();
    mockedAuth.getUser.mockReturnValueOnce(pending.promise);
    let sync!: Promise<void>;
    act(() => {
      sync = result.current.syncUserIfStale(0);
    });

    await switchToB(result);

    await act(async () => {
      pending.resolve(userA);
      await sync;
    });
    expect(result.current.user?.id).toBe('b');
    expect(result.current.authState.authenticated).toBe(true);
  });

  it("a failing refresh from user A's session does not log out user B", async () => {
    const { result } = await signedInAsA();

    const pending = deferred<User>();
    mockedAuth.getUser.mockReturnValueOnce(pending.promise);
    let refresh!: Promise<void>;
    act(() => {
      refresh = result.current.refreshUser();
    });

    await switchToB(result);

    await act(async () => {
      pending.reject(new Error('401'));
      await refresh;
    });
    expect(result.current.user?.id).toBe('b');
    expect(result.current.authState.authenticated).toBe(true);
    expect(store.token).toBe('token-b');
  });

  it('user B can still sync right after switching (no stale in-flight lock)', async () => {
    const { result } = await signedInAsA();

    const pending = deferred<User>();
    mockedAuth.getUser.mockReturnValueOnce(pending.promise);
    act(() => {
      result.current.syncUserIfStale(0);
    });

    await switchToB(result);

    const freshB = { ...userB, email: 'b-new@test.dev' } as User;
    mockedAuth.getUser.mockResolvedValueOnce(freshB);
    await act(async () => {
      await result.current.syncUserIfStale(0);
    });
    expect(result.current.user?.email).toBe('b-new@test.dev');
  });
});
