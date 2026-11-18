import BaseApiService from "../config/BaseApiService";

export default class CompaniesService extends BaseApiService {
  static async create(name: string): Promise<Company> {
    const { data } = await this.post<Company>('/companies', { name });
    return data;
  }

  static async listMembers(companyId: string): Promise<CompanyMember[]> {
    const { data } = await this.get<CompanyMember[]>(`/companies/${companyId}/members`);
    return data;
  }

  /**
   * Adds the user owning `code` (6 digits) to the company. Requires OWNER/ADMIN.
   * Rejects with 404 (unknown code), 409 (already a member), 403, 402 or 429.
   */
  static async addMemberByCode(
    companyId: string,
    code: string,
    role: AssignableRole,
  ): Promise<CompanyMember> {
    const { data } = await this.post<CompanyMember>(
      `/companies/${companyId}/members`,
      { code, role },
    );
    return data;
  }

  /** Removes a member. Rejects with 403 (no permission) or 409 (last owner). */
  static async removeMember(companyId: string, userId: string): Promise<void> {
    await this.delete(`/companies/${companyId}/members/${userId}`);
  }
}
