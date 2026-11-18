import BaseApiService from "../config/BaseApiService";

export default class MeService extends BaseApiService {
  /**
   * Assigns a new member code to the current user, invalidating the old one.
   * Rate limited by the API (5 per hour) — rejects with a 429 AxiosError.
   */
  static async regenerateMemberCode(): Promise<string> {
    const { data } = await this.post<{ memberCode: string }>(
      "/me/member-code/regenerate",
      {},
    );
    return data.memberCode;
  }
}
