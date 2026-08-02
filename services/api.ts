import config from "@/config/env";
import { parsePlanLimitPayload, type PlanLimitPayload } from "@/services/errors/PlanLimit";
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
 * Callback invoked when any API call returns 402 (plan limit exceeded).
 * Registered by PlanLimitContext so it can surface the limit and the paywall.
 * Receives null when the response body doesn't carry a recognizable payload.
 */
let onPlanLimitExceeded: ((payload: PlanLimitPayload | null) => void) | null = null;

export const setOnPlanLimitExceeded = (
  handler: ((payload: PlanLimitPayload | null) => void) | null,
) => {
  onPlanLimitExceeded = handler;
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
      onPlanLimitExceeded?.(parsePlanLimitPayload(error?.response?.data));
    }
    // Still rejects, so existing per-screen catch blocks keep working
    return Promise.reject(error);
  }
);

export default api;
