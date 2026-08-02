import Constants from 'expo-constants';

/**
 * The running app's marketing version, sourced from `app.json`'s `expo.version`
 * at runtime via expo-constants. This is the same field that drives EAS Update's
 * `runtimeVersion` (`policy: "appVersion"`), so it's the canonical client
 * version to compare against the backend's declared minimum.
 *
 * Centralized here so the read is isolated and easy to mock in tests.
 */
export function getAppVersion(): string {
  return Constants.expoConfig?.version ?? '0.0.0';
}