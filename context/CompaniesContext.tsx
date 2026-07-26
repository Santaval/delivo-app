import api from "@/services/api";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface CompaniesContextType {
  companies: Company[];
  selectCompany: (companyId: string) => Promise<void>;
  activeCompany: Company | null;
  isLoadingActiveCompany: boolean;
}

const CompaniesContext = createContext<CompaniesContextType>({
  companies: [],
  selectCompany: async () => {},
  activeCompany: null,
  isLoadingActiveCompany: true,
});

export const CompaniesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [isLoadingActiveCompany, setIsLoadingActiveCompany] =
    useState<boolean>(true);
  const { user, authState } = useAuth();

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
    if (authState.isLoading) return;
    setCompanies(user?.companies || []);
  }, [user, authState.isLoading]);

  useEffect(() => {
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

      // If user has no companies, redirect to add company page
      if (!user.companies || user.companies.length === 0) {
        router.push("/companies/add");
        setIsLoadingActiveCompany(false);
        return;
      }

      // A user with companies exists, so we're committed to resolving one.
      // Set before the sync check below, otherwise a login right after a logout
      // (which set the flag false) would report "loaded with no company" and
      // make PurchasesContext log out of RevenueCat for no reason.
      setIsLoadingActiveCompany(true);

      // Ensure companies state is synced with user data — still loading
      if (companies.length === 0) {
        return;
      }

      try {
        const storedCompanyId = await SecureStore.getItemAsync("activeCompany");

        // If no stored company ID, redirect to company selection
        if (!storedCompanyId) {
          router.push("/companies/select");
          return;
        }

        // Verify the stored company ID belongs to the current user
        const company = companies.find((c) => c.id === storedCompanyId);
        if (!company) {
          await SecureStore.deleteItemAsync("activeCompany"); // Clean up invalid stored ID
          router.push("/companies/select");
          return;
        }

        // Set the active company and configure API headers
        api.defaults.headers.common["x-company-id"] = storedCompanyId;
        setActiveCompany(company);
      } finally {
        // Every path out of here must settle the flag — PurchasesContext gates
        // the whole RevenueCat identity sync on it.
        setIsLoadingActiveCompany(false);
      }
    };

    loadActiveCompany();
  }, [companies, authState.isLoading, user]);

  return (
    <CompaniesContext.Provider
      value={{
        companies,
        selectCompany,
        activeCompany,
        isLoadingActiveCompany,
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
