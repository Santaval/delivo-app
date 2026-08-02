import { AxiosError } from "axios";
import BaseApiService from "../config/BaseApiService";

export default class VersionService extends BaseApiService {
  /**
   * Fetches the minimum supported frontend version from the backend.
   * The endpoint is unauthenticated, so it never trips the 401 interceptor.
   *
   * @returns The minimum supported version string (e.g. "1.2.12").
   * @throws Error with the server message if the request fails.
   */
  static async getMinVersion(): Promise<string> {
    try {
      const { data } = await this.get<VersionResponse>(
        `/system/min-frontend-version`,
      );
      console.log("Min version fetched:", data.minVersion);
      return data.minVersion;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message || axiosError.message);
    }
  }
}
