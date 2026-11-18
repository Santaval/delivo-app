import { toast } from "@/context/ToastContext";
import i18n from "@/i18n";
import api, { setOnForbidden, setOnUnauthorized } from "@/services/api";
import AuthService from "@/services/auth/Auth.service";
import { clearStoredActiveCompany } from "@/utils/activeCompanyStorage";
import { Observe } from "expo-observe";
import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

/**
 * Represents the authentication state of the application
 * @interface AuthState
 */
interface AuthState {
  /** JWT token for API authentication */
  token: string | null;
  /** Whether the user is currently authenticated */
  authenticated: boolean;
  /** Whether an async operation is in progress */
  isLoading: boolean;
  /** Current error message, if any */
  error: string | null;
}

/**
 * Defines the shape of the authentication context
 * @interface AuthContextType
 */
interface AuthContextType {
  /** Current authenticated user data */
  user: User | null;
  /** Function to authenticate user with Google */
  googleAuth: (token: string) => Promise<void>;
  /** Function to authenticate user with Apple */
  appleAuth: (token: string) => Promise<void>;
  /** Function to qa log in */
  qaLogin: (username: string, password: string) => Promise<void>;
  /** Function to log out the current user */
  logout: () => Promise<void>;
  /** Current authentication state */
  authState: AuthState;
  /** Function to clear any current error */
  clearError: () => void;
  /** Function to update user data */
  updateUser: (userData: Partial<User>) => Promise<void>;
  /** Function to refresh user data */
  refreshUser: () => Promise<void>;
  /**
   * Silently re-syncs the user (and therefore their companies) when the data is
   * older than `minIntervalMs` (default 30s). Unlike `refreshUser` it never logs
   * the user out on failure — it is meant for background triggers (foreground,
   * drawer open) where being offline is normal.
   */
  syncUserIfStale: (minIntervalMs?: number) => Promise<void>;
  /** Function to permanently delete the current account */
  deleteAccount: () => Promise<void>;
}

const SYNC_MIN_INTERVAL_MS = 30_000;
const FORBIDDEN_SYNC_MIN_INTERVAL_MS = 5_000;

/**
 * Initial state for authentication
 */
const initialState: AuthState = {
  token: null,
  authenticated: false,
  isLoading: true,
  error: null,
};

/**
 * Context for managing authentication state throughout the application
 */
const AuthContext = createContext<AuthContextType>({
  user: null,
  googleAuth: async () => {},
  appleAuth: async () => {},
  qaLogin: async () => {},
  logout: async () => {},
  authState: initialState,
  clearError: () => {},
  updateUser: async () => {},
  refreshUser: async () => {},
  syncUserIfStale: async () => {},
  deleteAccount: async () => {},
});

/**
 * Provider component that manages authentication state and provides authentication methods
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped with auth context
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>(initialState);

  // Bumped on every login and logout. Any async work that writes the user
  // captures it first and drops its result if it changed, so a /auth/me that
  // started under the previous account can never overwrite the new one.
  const sessionRef = useRef(0);
  const startSession = () => ++sessionRef.current;
  const isCurrentSession = (epoch: number) => sessionRef.current === epoch;

  /**
   * Updates the loading state
   * @param {boolean} isLoading - Whether an async operation is in progress
   */
  const setLoading = (isLoading: boolean) => {
    setAuthState((prev) => ({ ...prev, isLoading }));
  };

  /**
   * Sets an error message in the auth state
   * @param {string | null} error - Error message to set
   */
  const setError = (error: string | null) => {
    setAuthState((prev) => ({ ...prev, error }));
  };

  /**
   * Clears any current error message
   */
  const clearError = () => setError(null);

  /**
   * Updates the authentication state with new token and authentication status
   * @param {string | null} token - New authentication token
   * @param {boolean} authenticated - Whether the user is authenticated
   */
  const updateAuthState = (token: string | null, authenticated: boolean) => {
    setAuthState((prev) => ({
      ...prev,
      token,
      authenticated,
      error: null,
    }));
  };

  /**
   * Sets up API authentication headers with the provided token
   * @param {string | null} token - Token to set in API headers
   */
  const setupApiAuth = (token: string | null) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  };

  const googleAuth = async (token: string) => {
    const epoch = startSession();
    const { token: jwtToken, user } = await AuthService.googleAuth(token);
    if (!isCurrentSession(epoch)) return;
    await SecureStore.setItemAsync("token", jwtToken);
    setupApiAuth(jwtToken);
    updateAuthState(jwtToken, true);
    setUser(user);
  };

  const appleAuth = async (token: string) => {
    const epoch = startSession();
    const { token: jwtToken, user } = await AuthService.appleAuth(token);
    if (!isCurrentSession(epoch)) return;
    await SecureStore.setItemAsync("token", jwtToken);
    setupApiAuth(jwtToken);
    updateAuthState(jwtToken, true);
    setUser(user);
  };

  const qaLogin = async (username: string, password: string) => {
    try {
      setLoading(true);
      const epoch = startSession();
      const { token: jwtToken, user } = await AuthService.qaLogin(
        username,
        password,
      );
      if (!isCurrentSession(epoch)) return;
      await SecureStore.setItemAsync("token", jwtToken);
      setupApiAuth(jwtToken);
      updateAuthState(jwtToken, true);
      setUser(user);
    } catch (error) {
      setError(error instanceof Error ? error.message : "QA login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect hook to load and validate stored authentication token on mount
   */
  useEffect(() => {
    const loadToken = async () => {
      const epoch = sessionRef.current;
      try {
        const token = await SecureStore.getItemAsync("token");

        if (token && isCurrentSession(epoch)) {
          setupApiAuth(token);
          const user = await AuthService.getUser();
          // A login/logout happened while the stored session was loading
          if (!isCurrentSession(epoch)) return;

          if (user) {
            updateAuthState(token, true);
            setUser(user);
          } else {
            await handleLogout();
          }
        }
      } catch (error) {
        if (!isCurrentSession(epoch)) return;
        await handleLogout();
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load user session",
        );
      } finally {
        setLoading(false);
        Observe.markInteractive();
      }
    };

    loadToken();
  }, []);

  /**
   * Effect hook to force logout + redirect when any API call returns 401
   * (expired session). Guarded so a burst of parallel 401s only logs out once.
   */
  useEffect(() => {
    let handling = false;
    setOnUnauthorized(() => {
      if (handling) return;
      handling = true;
      (async () => {
        try {
          await handleLogout();
          toast.info(i18n.t("sessionExpired"));
          // Clearing `authenticated` above is enough — the guard in
          // app/_layout.tsx redirects to the login screen.
        } finally {
          handling = false;
        }
      })();
    });
    return () => setOnUnauthorized(null);
  }, []);

  // Background re-sync, shared by the AppState/drawer/403 triggers. One request
  // at a time, and not more often than `minIntervalMs`.
  const lastSyncAt = useRef(0);
  const syncInFlight = useRef(false);
  const authenticatedRef = useRef(false);
  authenticatedRef.current = authState.authenticated;

  const refreshUser = async () => {
    const epoch = sessionRef.current;
    try {
      const user = await AuthService.getUser();
      if (!isCurrentSession(epoch)) return;
      lastSyncAt.current = Date.now();
      setUser(user);
    } catch (error) {
      // A failure from a previous session must not log out the current one
      if (isCurrentSession(epoch)) await handleLogout();
    }
  };

  const syncUserIfStale = useCallback(async (minIntervalMs = SYNC_MIN_INTERVAL_MS) => {
    if (!authenticatedRef.current || syncInFlight.current) return;
    if (Date.now() - lastSyncAt.current < minIntervalMs) return;
    const epoch = sessionRef.current;
    syncInFlight.current = true;
    // Stamped up front so a failing request is not retried in a tight loop
    lastSyncAt.current = Date.now();
    try {
      const fresh = await AuthService.getUser();
      // Logged out or switched account while the request was in flight:
      // `fresh` belongs to the previous user, drop it
      if (isCurrentSession(epoch) && authenticatedRef.current) setUser(fresh);
    } catch {
      // Offline / transient: keep the current user. A truly expired session
      // surfaces as a 401 on the next real request and logs out there.
    } finally {
      // handleLogout already reset it for the new session
      if (isCurrentSession(epoch)) syncInFlight.current = false;
    }
  }, []);

  // Refresh when the app returns to the foreground
  useEffect(() => {
    if (!authState.authenticated) return;
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") syncUserIfStale();
    });
    return () => sub.remove();
  }, [authState.authenticated, syncUserIfStale]);

  // A 403 on a company-scoped request may mean we were removed from the active
  // company. Resync (a few seconds of de-duplication; CompaniesContext drops the
  // company if it is no longer in the user's list). The failed request still
  // rejects to its caller.
  useEffect(() => {
    if (!authState.authenticated) return;
    setOnForbidden(() => syncUserIfStale(FORBIDDEN_SYNC_MIN_INTERVAL_MS));
    return () => setOnForbidden(null);
  }, [authState.authenticated, syncUserIfStale]);

  /**
   * Handles the logout process by clearing auth state and removing stored token
   */
  const handleLogout = async () => {
    startSession();
    lastSyncAt.current = 0;
    syncInFlight.current = false;
    updateAuthState(null, false);
    setUser(null);
    await SecureStore.deleteItemAsync("token");
    setupApiAuth(null);
  };

  /**
   * Logs out the current user and redirects to login page
   * @throws {Error} If logout process fails
   */
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await handleLogout();
      // Clearing `authenticated` above is enough — the guard in
      // app/_layout.tsx redirects to the login screen.
    } catch (error) {
      setError(error instanceof Error ? error.message : "Logout failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Updates the user data and refreshes the local state
   * @param userData - Partial user data to update
   */
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      setLoading(true);
      if (user) {
        const epoch = sessionRef.current;
        const updatedUser = await AuthService.getUser();
        if (!isCurrentSession(epoch)) return;
        setUser({ ...updatedUser, ...userData });
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update user",
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Permanently deletes the current account. Only clears the persisted
   * company id — the session itself stays active until the caller explicitly
   * logs out (e.g. from the "done" screen), matching the account-deletion flow.
   */
  const deleteAccount = async (): Promise<void> => {
    const appleAuthCode = await SecureStore.getItemAsync("appleAuthCode");
    await AuthService.deleteAccount(appleAuthCode || undefined);
    // delete the apple auth code if it exists
    await SecureStore.deleteItemAsync("appleAuthCode");
    // La cuenta ya no existe: el id de empresa guardado nunca volverá a ser válido.
    if (user) await clearStoredActiveCompany(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        logout,
        googleAuth,
        appleAuth,
        qaLogin,
        authState,
        clearError,
        updateUser,
        refreshUser,
        syncUserIfStale,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context
 * @returns {AuthContextType} The authentication context
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
