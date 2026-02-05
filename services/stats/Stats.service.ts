import BaseApiService from "../config/BaseApiService";

export default class StatsService extends BaseApiService {

  static async financialSummary(): Promise<FinancialSummary> {
    try {
      const response = await this.get<FinancialSummary>('/stats/financial-summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      throw error;
    }
  }

}