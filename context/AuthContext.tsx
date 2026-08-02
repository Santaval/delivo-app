import { toast } from "@/context/ToastContext";
import i18n from "@/i18n";
import api, { setOnUnauthorized } from "@/services/api";
import AuthService from "@/services/auth/Auth.service";
import { Observe } from "expo-observe";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";

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
}

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
});

/**
 * Provider component that manages authentication state and provides authentication methods
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped with auth context
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authMail, setAuthMail] = useState<string>("");
  const [authState, setAuthState] = useState<AuthState>(initialState);

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
    const { token: jwtToken, user } = await AuthService.googleAuth(token);
    await SecureStore.setItemAsync("token", jwtToken);
    setupApiAuth(jwtToken);
    updateAuthState(jwtToken, true);
    setUser(user);
  };

  const appleAuth = async (token: string) => {
    const { token: jwtToken, user } = await AuthService.appleAuth(token);
    await SecureStore.setItemAsync("token", jwtToken);
    setupApiAuth(jwtToken);
    updateAuthState(jwtToken, true);
    setUser(user);
  };

  const qaLogin = async (username: string, password: string) => {
    try {
      setLoading(true);
      const { token: jwtToken, user } = await AuthService.qaLogin(
        username,
        password,
      );
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
      try {
        const token = await SecureStore.getItemAsync("token");

        if (token) {
          setupApiAuth(token);
          const user = await AuthService.getUser();

          if (user) {
            updateAuthState(token, true);
            setUser(user);
          } else {
            await handleLogout();
          }
        }
      } catch (error) {
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

  const refreshUser = async () => {
    try {
      const user = await AuthService.getUser();
      setUser(user);
    } catch (error) {
      await handleLogout();
    }
  };

  /**
   * Handles the logout process by clearing auth state and removing stored token
   */
  const handleLogout = async () => {
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
        const updatedUser = await AuthService.getUser();
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
