type CompanyRole = "OWNER" | "ADMIN" | "DEALER";

/** Roles that can be assigned when adding a member by code (the API rejects OWNER). */
type AssignableRole = Exclude<CompanyRole, "OWNER">;

interface CompanyMember {
  userId: string;
  name: string;
  surnames: string;
  email: string;
  role: CompanyRole;
}
