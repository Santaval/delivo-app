/**
 * Response shape for GET /version — the backend's declared minimum supported
 * frontend version (semver `major.minor.patch`).
 */
interface VersionResponse {
  minVersion: string;
}