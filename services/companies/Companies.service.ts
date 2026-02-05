import BaseApiService from "../config/BaseApiService";

export default class CompaniesService extends BaseApiService {
  static async create(name: string): Promise<Company> {
    const { data } = await this.post<Company>('/companies', { name });
    return data;
  }
}