import api from "@/services/api";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface CompaniesContextType {
  companies: Company[];
  selectCompany: (companyId: string) => void;
  activeCompany: Company | null;
}

const CompaniesContext = createContext<CompaniesContextType>({
  companies: [],
  selectCompany: () => {},
  activeCompany: null,
});

export const CompaniesProvider = ({ children }: { children: React.ReactNode }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const { user, authState } = useAuth();

  const selectCompany = (companyId: string) => {
    // storage on AsyncStorage
    SecureStore.setItemAsync("activeCompany", companyId);
    // set x-company-id header on axios instance
    api.defaults.headers.common["x-company-id"] = companyId;
    const company = companies.find(c => c.id === companyId) || null;
    setActiveCompany(company);
  };

  useEffect(() => {
    if (authState.isLoading) return;
    setCompanies(user?.companies || []);
  }, [user, authState.isLoading]);

  useEffect(() => {
    const loadActiveCompany = async () => {
      console.log(user)
      // Don't proceed if still loading or no user
      if (authState.isLoading || !user) return;
      
      // If user has no companies, redirect to add company page
      if (!user.companies || user.companies.length === 0) {
        console.log("No companies found for user - redirecting to add company");
        router.push("/companies/add");
        return;
      }

      // Ensure companies state is synced with user data
      if (companies.length === 0) {
        console.log("Companies not yet loaded in state");
        return;
      }

      const storedCompanyId = await SecureStore.getItemAsync("activeCompany");
      console.log(storedCompanyId)

      // If no stored company ID, redirect to company selection
      if (!storedCompanyId) {
        console.log("No active company stored - redirecting to company selection");
        router.push("/companies/select");
        return;
      }

      // Verify the stored company ID belongs to the current user
      const isValidCompany = companies.some(c => c.id === storedCompanyId);
      if (!isValidCompany) {
        console.log("Stored company ID does not belong to user - redirecting to company selection");
        await SecureStore.deleteItemAsync("activeCompany"); // Clean up invalid stored ID
        router.push("/companies/select");
        return;
      }

      // Set the active company and configure API headers
      const company = companies.find(c => c.id === storedCompanyId);
      if (company) {
        console.log("Setting active company:", company.name);
        api.defaults.headers.common["x-company-id"] = storedCompanyId;
        setActiveCompany(company);
      } else {
        console.log("Company not found in companies array - redirecting to company selection");
        router.push("/companies/select");
      }
    };

    loadActiveCompany();
  }, [companies, authState.isLoading, user]);

  return (
    <CompaniesContext.Provider value={{ companies, selectCompany, activeCompany }}>
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
