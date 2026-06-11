import RevenueCatService, { ENTITLEMENTS } from '@/services/purchases/RevenueCat.service';
import { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAuth } from './AuthContext';

interface PurchasesContextType {
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOffering | null;
  isPro: boolean;
  isLoading: boolean;
  error: string | null;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  presentPaywall: () => Promise<boolean>;
  presentPaywallIfNeeded: () => Promise<boolean>;
  presentCustomerCenter: () => Promise<void>;
  refreshCustomerInfo: () => Promise<void>;
}

const PurchasesContext = createContext<PurchasesContextType>({
  customerInfo: null,
  offerings: null,
  isPro: false,
  isLoading: false,
  error: null,
  purchasePackage: async () => false,
  restorePurchases: async () => false,
  presentPaywall: async () => false,
  presentPaywallIfNeeded: async () => false,
  presentCustomerCenter: async () => {},
  refreshCustomerInfo: async () => {},
});

export const PurchasesProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, authState } = useAuth();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPro = customerInfo
    ? RevenueCatService.isProActive(customerInfo)
    : false;

  // Log in to RevenueCat when the user authenticates
  useEffect(() => {
    if (authState.isLoading) return;

    if (user?.id) {
      RevenueCatService.logIn(user.id).catch(() => {});
    }
  }, [user?.id, authState.isLoading]);

  // Fetch initial customer info and offerings after login
  useEffect(() => {
    if (authState.isLoading || !user) return;

    const init = async () => {
      try {
        setIsLoading(true);
        const [info, offering] = await Promise.all([
          RevenueCatService.getCustomerInfo(),
          RevenueCatService.getOfferings(),
        ]);
        setCustomerInfo(info);
        setOfferings(offering);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load subscription info');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [user, authState.isLoading]);

  // Listen for real-time customer info updates (e.g., after purchase)
  useEffect(() => {
    const listener = (info: CustomerInfo) => setCustomerInfo(info);
    RevenueCatService.addCustomerInfoUpdateListener(listener);
    return () => RevenueCatService.removeCustomerInfoUpdateListener(listener);
  }, []);

  const refreshCustomerInfo = useCallback(async () => {
    try {
      const info = await RevenueCatService.getCustomerInfo();
      setCustomerInfo(info);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to refresh subscription');
    }
  }, []);

  const purchasePackage = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      const info = await RevenueCatService.purchasePackage(pkg);
      setCustomerInfo(info);
      return RevenueCatService.isProActive(info);
    } catch (e: any) {
      // userCancelled is not a real error
      if (!e.userCancelled) {
        setError(e.message ?? 'Purchase failed');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      const info = await RevenueCatService.restorePurchases();
      setCustomerInfo(info);
      return RevenueCatService.isProActive(info);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Restore failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const presentPaywall = useCallback(async (): Promise<boolean> => {
    const result = await RevenueCatUI.presentPaywall();
    return result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
  }, []);

  const presentPaywallIfNeeded = useCallback(async (): Promise<boolean> => {
    const result = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: ENTITLEMENTS.PRO,
    });
    return result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
  }, []);

  const presentCustomerCenter = useCallback(async (): Promise<void> => {
    await RevenueCatUI.presentCustomerCenter({
      callbacks: {
        onRestoreCompleted: ({ customerInfo: info }) => setCustomerInfo(info),
        onRefundRequestCompleted: ({ productIdentifier, refundRequestStatus }) => {
          if (refundRequestStatus === 0) {
            // Refund approved — refresh customer info
            refreshCustomerInfo();
          }
        },
      },
    });
  }, [refreshCustomerInfo]);

  return (
    <PurchasesContext.Provider
      value={{
        customerInfo,
        offerings,
        isPro,
        isLoading,
        error,
        purchasePackage,
        restorePurchases,
        presentPaywall,
        presentPaywallIfNeeded,
        presentCustomerCenter,
        refreshCustomerInfo,
      }}
    >
      {children}
    </PurchasesContext.Provider>
  );
};

export const usePurchases = () => {
  const context = useContext(PurchasesContext);
  if (!context) {
    throw new Error('usePurchases must be used within a PurchasesProvider');
  }
  return context;
};
