import config from "@/config/env";
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? '';
    // Auth endpoints legitimately return 401 on bad credentials
    if (status === 401 && !url.includes('/auth/')) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export default api;
