import api from "@/services/api";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";

interface CompaniesContextType {
  companies: Company[];
  selectCompany: (companyId: string) => Promise<void>;
  activeCompany: Company | null;
  isLoadingActiveCompany: boolean;
  /** Signed-in user has no companies yet — the layout routes to company creation. */
  needsCompanyCreation: boolean;
  /** Signed-in user has companies but none is active — the layout routes to selection. */
  needsCompanySelection: boolean;
}

const CompaniesContext = createContext<CompaniesContextType>({
  companies: [],
  selectCompany: async () => {},
  activeCompany: null,
  isLoadingActiveCompany: true,
  needsCompanyCreation: false,
  needsCompanySelection: false,
});

export const CompaniesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [isLoadingActiveCompany, setIsLoadingActiveCompany] =
    useState<boolean>(true);
  const { user, authState } = useAuth();
  // Derived straight from the user so it can never lag behind a refreshUser():
  // a stale copy would let loadActiveCompany resolve a company the user just left.
  const companies = useMemo<Company[]>(() => user?.companies ?? [], [user]);

  const selectCompany = async (companyId: string) => {
    // Awaited so the key is committed before loadActiveCompany can read it back
    await SecureStore.setItemAsync("activeCompany", companyId);
    // set x-company-id header on axios instance
    api.defaults.headers.common["x-company-id"] = companyId;
    // Only set when the lookup hits — a miss means `companies` hasn't synced yet
    // (e.g. a just-created company), and blanking it here would drop the
    // RevenueCat identity. loadActiveCompany resolves it once companies arrive.
    const company = companies.find((c) => c.id === companyId);
    if (company) setActiveCompany(company);
  };

  useEffect(() => {
    // A newer run supersedes this one: its awaits must not write stale state
    let cancelled = false;

    /**
     * The active company is gone (left, removed, or the user has none): drop it
     * everywhere. Without clearing the header every later request would still
     * claim the old tenant, and without the stored key the next launch would
     * try to resolve it again.
     */
    const dropActiveCompany = async () => {
      if (cancelled) return;
      delete api.defaults.headers.common["x-company-id"];
      await SecureStore.deleteItemAsync("activeCompany");
      if (!cancelled) setActiveCompany(null);
    };

    const loadActiveCompany = async () => {
      // Auth is still resolving — genuinely still loading, leave the flag alone
      if (authState.isLoading) return;

      // Logged out: drop the active company and stop sending the previous
      // tenant's id. Clearing activeCompany is what tells PurchasesContext to
      // log out of RevenueCat. The stored key is kept so re-login lands back in
      // the same company; it's validated against the new user's list below.
      if (!user) {
        setActiveCompany(null);
        delete api.defaults.headers.common["x-company-id"];
        setIsLoadingActiveCompany(false);
        return;
      }

      // The user has no companies (new account, or they left their last one):
      // nothing to resolve, and nothing stored can be valid anymore. The guard
      // in app/_layout.tsx sends them to company creation.
      if (companies.length === 0) {
        try {
          await dropActiveCompany();
        } finally {
          if (!cancelled) setIsLoadingActiveCompany(false);
        }
        return;
      }

      // A user with companies exists, so we're committed to resolving one.
      // Set before the awaits below, otherwise a login right after a logout
      // (which set the flag false) would report "loaded with no company" and
      // make PurchasesContext log out of RevenueCat for no reason.
      setIsLoadingActiveCompany(true);

      try {
        const storedCompanyId = await SecureStore.getItemAsync("activeCompany");
        if (cancelled) return;

        // No stored company ID — nothing to resolve. The guard in
        // app/_layout.tsx sends the user to company selection.
        if (!storedCompanyId) {
          delete api.defaults.headers.common["x-company-id"];
          setActiveCompany(null);
          return;
        }

        // Verify the stored company ID still belongs to the current user
        const company = companies.find((c) => c.id === storedCompanyId);
        if (!company) {
          await dropActiveCompany(); // Clean up invalid stored ID
          return;
        }

        // Set the active company and configure API headers
        api.defaults.headers.common["x-company-id"] = storedCompanyId;
        setActiveCompany(company);
      } finally {
        // Every path out of here must settle the flag — PurchasesContext gates
        // the whole RevenueCat identity sync on it.
        if (!cancelled) setIsLoadingActiveCompany(false);
      }
    };

    loadActiveCompany();
    return () => {
      cancelled = true;
    };
  }, [companies, authState.isLoading, user]);

  const needsCompanyCreation =
    !isLoadingActiveCompany && !activeCompany && companies.length === 0;
  const needsCompanySelection =
    !isLoadingActiveCompany && !activeCompany && companies.length > 0;

  return (
    <CompaniesContext.Provider
      value={{
        companies,
        selectCompany,
        activeCompany,
        isLoadingActiveCompany,
        needsCompanyCreation,
        needsCompanySelection,
      }}
    >
      {children}
    </CompaniesContext.Provider>
  );
};

const useCompanies = () => {
  const context = useContext(CompaniesContext);
  if (!context) {
    throw new Error("useCompanies must be used within a CompaniesProvider");
  }
  return context;
};

export { useCompanies };
