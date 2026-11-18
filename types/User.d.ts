interface User {
  id: string;
  email: string;
  name: string;
  surnames: string;
  /** 6-digit code other owners/admins use to add this user to a company. */
  memberCode: string | null;
  companies: Company[];
}

