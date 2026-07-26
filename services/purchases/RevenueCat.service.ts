import config from '@/config/env';
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';
import { Platform } from 'react-native';

export const ENTITLEMENTS = {
  PRO: 'arranque',
} as const;

export const OFFERING_IDENTIFIERS = {
  DEFAULT: 'delivo_arranque',
} as const;

class RevenueCatService {
  configure(): void {
    const apiKey = Platform.OS === 'ios'
      ? config.revenueCatIosKey
      : config.revenueCatAndroidKey;

    if (config.isDevelopment) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    Purchases.configure({ apiKey });
  }

  /** `appUserId` is the active company id — subscriptions belong to a company, not a user. */
  async logIn(appUserId: string): Promise<void> {
    await Purchases.logIn(appUserId);
  }

  async logOut(): Promise<void> {
    // logOut rejects if the current app user id is already anonymous, which is
    // a normal state here (fresh install, or logging out twice)
    if (await Purchases.isAnonymous()) return;
    await Purchases.logOut();
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    return Purchases.getCustomerInfo();
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  }

  async purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  }

  async restorePurchases(): Promise<CustomerInfo> {
    return Purchases.restorePurchases();
  }

  isProActive(customerInfo: CustomerInfo): boolean {
    return !!customerInfo.entitlements.active[ENTITLEMENTS.PRO];
  }

  addCustomerInfoUpdateListener(callback: (info: CustomerInfo) => void): void {
    Purchases.addCustomerInfoUpdateListener(callback);
  }

  removeCustomerInfoUpdateListener(callback: (info: CustomerInfo) => void): void {
    Purchases.removeCustomerInfoUpdateListener(callback);
  }
}

export default new RevenueCatService();
