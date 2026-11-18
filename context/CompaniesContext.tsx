import { toast } from "@/context/ToastContext";
import i18n from "@/i18n";
import api from "@/services/api";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
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
  const activeCompanyRef = useRef<Company | null>(null);
  activeCompanyRef.current = activeCompany;
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

  // "You were added to X": a company id that appears in a later refresh of the
  // same user. The first load / a login (no previous list for this user) never
  // toasts, and neither does a company this device just created and selected
  // (selectCompany sets the header before the refresh lands).
  const knownCompanyIds = useRef<{ userId: string; ids: Set<string> } | null>(null);
  useEffect(() => {
    if (!user) {
      knownCompanyIds.current = null;
      return;
    }
    const previous = knownCompanyIds.current;
    if (previous && previous.userId === user.id) {
      const justSelectedId = api.defaults.headers.common["x-company-id"];
      const added = companies.filter(
        (c) => !previous.ids.has(c.id) && c.id !== justSelectedId,
      );
      for (const company of added) {
        toast.info(i18n.t("addedToCompany", { company: company.name }));
      }
    }
    knownCompanyIds.current = { userId: user.id, ids: new Set(companies.map((c) => c.id)) };
  }, [companies, user]);

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
      // Skipped while a company is already active: this is then just a
      // background refresh of the user, and flipping the flag would make the
      // root layout treat the app as bootstrapping and flash the splash screen.
      if (!activeCompanyRef.current) setIsLoadingActiveCompany(true);

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
        // Keep the same object when nothing changed so a background refresh of
        // the user doesn't re-render every consumer of the context
        setActiveCompany((prev) =>
          prev && JSON.stringify(prev) === JSON.stringify(company) ? prev : company,
        );
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
