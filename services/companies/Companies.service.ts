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

  /** Pending invitations only. Requires an OWNER/ADMIN role (403 otherwise). */
  static async listInvitations(companyId: string): Promise<CompanyInvitation[]> {
    const { data } = await this.get<CompanyInvitation[]>(`/companies/${companyId}/invitations`);
    return data;
  }

  static async inviteMember(
    companyId: string,
    email: string,
    role: InvitableRole,
  ): Promise<CompanyInvitation> {
    const { data } = await this.post<CompanyInvitation>(
      `/companies/${companyId}/invitations`,
      { email, role },
    );
    return data;
  }

  static async revokeInvitation(companyId: string, invitationId: string): Promise<void> {
    await this.delete(`/companies/${companyId}/invitations/${invitationId}`);
  }
}
