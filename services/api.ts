import config from "@/config/env";
import {
  parseInsufficientCreditsPayload,
  type InsufficientCreditsPayload,
} from "@/services/errors/InsufficientCredits";
import axios from "axios";

const api = axios.create({
  baseURL: config.apiUrl || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Callback invoked when any API call returns 401 (expired/invalid session).
 * Registered by AuthContext so it can clear the session and redirect to login.
 */
let onUnauthorized: (() => void) | null = null;

export const setOnUnauthorized = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

/**
 * Callback invoked when a 402 carries code INSUFFICIENT_CREDITS (the company is
 * out of bills). Registered by CreditsContext so it can show the out-of-credits sheet.
 */
let onInsufficientCredits: ((payload: InsufficientCreditsPayload) => void) | null = null;

export const setOnInsufficientCredits = (
  handler: ((payload: InsufficientCreditsPayload) => void) | null,
) => {
  onInsufficientCredits = handler;
};

/**
 * Callback invoked for any other 402 (no recognizable credits payload). Registered by
 * CreditsContext so it can show a generic error; api.ts must not import UI modules
 * (ToastContext pulls in reanimated), so the toast is wired from outside.
 */
let onPaymentRequired: (() => void) | null = null;

export const setOnPaymentRequired = (handler: (() => void) | null) => {
  onPaymentRequired = handler;
};

/**
 * Callback invoked when a company-scoped request returns 403. That may mean the
 * user was removed from the active company, so the registrant (AuthContext)
 * resyncs the user — the company then drops out of CompaniesContext. It is only
 * a hint: the error still rejects to the caller, so legitimate 403s (e.g. an
 * ADMIN trying to remove an OWNER) behave exactly as before.
 */
let onForbidden: (() => void) | null = null;

export const setOnForbidden = (handler: (() => void) | null) => {
  onForbidden = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? '';
    // Auth endpoints legitimately return 401 on bad credentials
    if (status === 401 && !url.includes('/auth/')) {
      onUnauthorized?.();
    }
    if (status === 402) {
      const credits = parseInsufficientCreditsPayload(error?.response?.data);
      if (credits) onInsufficientCredits?.(credits);
      else onPaymentRequired?.();
    }
    if (status === 403) {
      const companyId =
        error?.config?.headers?.['x-company-id'] ?? error?.config?.headers?.get?.('x-company-id');
      if (companyId) onForbidden?.();
    }
    // Still rejects, so existing per-screen catch blocks keep working
    return Promise.reject(error);
  }
);

export default api;
