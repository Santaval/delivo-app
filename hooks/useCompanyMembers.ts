import { useAuth } from "@/context/AuthContext";
import { useCompanies } from "@/context/CompaniesContext";
import CompaniesService from "@/services/companies/Companies.service";
import { useEffect, useState } from "react";

/**
 * Members of the active company plus the current user's role in it.
 *
 * The app has no role in any context: the only source is the members list
 * (`GET /companies/:companyId/members`), so `myRole` is derived from it.
 * While loading, or if the list fails, `myRole` is `undefined`; callers must
 * treat that as the least-privileged case.
 */
const useCompanyMembers = () => {
  const { user } = useAuth();
  const { activeCompany } = useCompanies();
  const companyId = activeCompany?.id;
  const userId = user?.id;

  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!companyId) {
      setMembers([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    CompaniesService.listMembers(companyId)
      .then((list) => {
        if (!cancelled) setMembers(list);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const myRole: CompanyRole | undefined = members.find((m) => m.userId === userId)?.role;
  /** OWNER/ADMIN see and manage every route; anyone else is limited to their own. */
  const canManageRoutes = myRole === "OWNER" || myRole === "ADMIN";

  return { members, myRole, canManageRoutes, userId, loading, error };
};

export default useCompanyMembers;
