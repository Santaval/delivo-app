type CompanyRole = "OWNER" | "ADMIN" | "DEALER";

/** Roles that can be assigned through an invitation (the API rejects OWNER). */
type InvitableRole = Exclude<CompanyRole, "OWNER">;

interface CompanyMember {
  userId: string;
  name: string;
  surnames: string;
  email: string;
  role: CompanyRole;
}

interface CompanyInvitation {
  id: string;
  email: string;
  role: CompanyRole;
  status: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
  expiresAt: string;
  createdAt: string;
}
