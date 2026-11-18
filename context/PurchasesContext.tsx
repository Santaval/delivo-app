import RevenueCatService from "@/services/purchases/RevenueCat.service";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { PurchasesOffering, PurchasesPackage } from "react-native-purchases";
import { useCompanies } from "./CompaniesContext";

interface PurchasesContextType {
  creditsOffering: PurchasesOffering | null;
  /** Company RevenueCat is currently logged in as; null while syncing or logged out. */
  identityCompanyId: string | null;
  /** RevenueCat is logged in as the active company, so a purchase is attributed to it. */
  isIdentityReady: boolean;
  isLoading: boolean;
  error: string | null;
  /** Credits are granted server-side by the webhook, not by this call. */
  purchaseCredits: (pkg: PurchasesPackage) => Promise<"purchased" | "cancelled" | "error">;
}

const PurchasesContext = createContext<PurchasesContextType>({
  creditsOffering: null,
  identityCompanyId: null,
  isIdentityReady: false,
  isLoading: false,
  error: null,
  purchaseCredits: async () => "error",
});

export const PurchasesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { activeCompany, isLoadingActiveCompany } = useCompanies(); // Ensure companies context is initialized before purchases
  const [creditsOffering, setCreditsOffering] = useState<PurchasesOffering | null>(null);
  const [identityCompanyId, setIdentityCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isIdentityReady =
    !isLoading && identityCompanyId !== null && identityCompanyId === activeCompany?.id;

  // Keep the RevenueCat identity in sync with the active company. Login and the
  // offerings read must be sequenced: if they race, the offerings can resolve
  // against the previous app user id.
  useEffect(() => {
    if (isLoadingActiveCompany) return;
    let cancelled = false;

    const syncIdentity = async () => {
      setIsLoading(true);
      setError(null);
      setIdentityCompanyId(null);
      try {
        if (!activeCompany?.id) {
          // Logged out or no company selected — go anonymous and drop the
          // previous company's offering
          await RevenueCatService.logOut();
          if (!cancelled) setCreditsOffering(null);
          return;
        }

        await RevenueCatService.logIn(activeCompany.id);
        const credits = await RevenueCatService.getCreditsOffering();
        if (!cancelled) {
          setCreditsOffering(credits);
          setIdentityCompanyId(activeCompany.id);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load credit packs",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    syncIdentity();
    return () => {
      cancelled = true;
    };
  }, [isLoadingActiveCompany, activeCompany?.id]);

  const purchaseCredits = useCallback(
    async (pkg: PurchasesPackage): Promise<"purchased" | "cancelled" | "error"> => {
      // Purchases are attributed to the RevenueCat app user id, so logIn must have
      // completed for the active company.
      if (!isIdentityReady) return "error";
      try {
        await RevenueCatService.purchasePackage(pkg);
        return "purchased";
      } catch (e: any) {
        if (e?.userCancelled) return "cancelled";
        console.error("Credit purchase failed:", e);
        return "error";
      }
    },
    [isIdentityReady],
  );

  return (
    <PurchasesContext.Provider
      value={{
        creditsOffering,
        identityCompanyId,
        isIdentityReady,
        isLoading,
        error,
        purchaseCredits,
      }}
    >
      {children}
    </PurchasesContext.Provider>
  );
};

export const usePurchases = () => {
  const context = useContext(PurchasesContext);
  if (!context) {
    throw new Error("usePurchases must be used within a PurchasesProvider");
  }
  return context;
};
