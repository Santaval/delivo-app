import * as SecureStore from "expo-secure-store";

/** Pre-per-user key: shared by every account that ever signed in on the device. */
const LEGACY_KEY = "activeCompany";

/**
 * The active company is remembered per user, so signing in with another
 * account on the same device never inherits the previous account's company.
 * SecureStore keys only allow alphanumerics, ".", "-" and "_".
 */
export const activeCompanyKey = (userId: string) =>
  `activeCompany_${userId.replace(/[^A-Za-z0-9._-]/g, "_")}`;

export const getStoredActiveCompany = async (userId: string): Promise<string | null> => {
  const stored = await SecureStore.getItemAsync(activeCompanyKey(userId));
  if (stored) return stored;
  // One-time migration of the legacy key: hand it to whoever signs in first,
  // then drop it so no other account can pick it up. It is still validated
  // against that user's companies by the caller.
  const legacy = await SecureStore.getItemAsync(LEGACY_KEY);
  if (!legacy) return null;
  await SecureStore.deleteItemAsync(LEGACY_KEY);
  await SecureStore.setItemAsync(activeCompanyKey(userId), legacy);
  return legacy;
};

export const setStoredActiveCompany = (userId: string, companyId: string) =>
  SecureStore.setItemAsync(activeCompanyKey(userId), companyId);

export const clearStoredActiveCompany = async (userId: string) => {
  await SecureStore.deleteItemAsync(activeCompanyKey(userId));
  await SecureStore.deleteItemAsync(LEGACY_KEY);
};
