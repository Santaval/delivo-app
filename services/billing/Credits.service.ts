import BaseApiService from "../config/BaseApiService";

export default class CreditsService extends BaseApiService {
  /**
   * The company id is sent explicitly so a response can never belong to a different
   * company than the caller expects (the default header changes on company switch).
   */
  static async getCredits(companyId: string): Promise<CreditsStatus> {
    const { data } = await this.get<CreditsStatus>("/billing/credits", {
      headers: { "x-company-id": companyId },
    });
    return data;
  }

  /** Newest entries first. */
  static async getLedger(companyId: string, page: number, pageSize = 20): Promise<CreditLedgerPage> {
    const { data } = await this.get<CreditLedgerPage>("/billing/credits/ledger", {
      params: { page, pageSize },
      headers: { "x-company-id": companyId },
    });
    return data;
  }
}
