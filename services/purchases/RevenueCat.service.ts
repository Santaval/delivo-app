import config from "@/config/env";
import { Platform } from "react-native";
import Purchases, {
  LOG_LEVEL,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";

export const OFFERING_IDENTIFIERS = {
  CREDITS: "delivo_credits",
} as const;

class RevenueCatService {
  configure(): void {
    const apiKey =
      Platform.OS === "ios"
        ? config.revenueCatIosKey
        : config.revenueCatAndroidKey;

    if (config.isDevelopment) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    Purchases.configure({ apiKey });
  }

  /** `appUserId` is the active company id — credits belong to a company, not a user. */
  async logIn(appUserId: string): Promise<void> {
    await Purchases.logIn(appUserId);
  }

  async logOut(): Promise<void> {
    // logOut rejects if the current app user id is already anonymous, which is
    // a normal state here (fresh install, or logging out twice)
    if (await Purchases.isAnonymous()) return;
    await Purchases.logOut();
  }

  /**
   * Fetched by identifier, not `offerings.current`, so the dashboard can keep the
   * legacy offering as Current while old store builds are still in use.
   */
  async getCreditsOffering(): Promise<PurchasesOffering | null> {
    const offerings = await Purchases.getOfferings();
    return offerings.all[OFFERING_IDENTIFIERS.CREDITS] ?? null;
  }

  /** Purchases a consumable; credits are granted server-side by the webhook. */
  async purchasePackage(pkg: PurchasesPackage): Promise<void> {
    await Purchases.purchasePackage(pkg);
  }


}

export default new RevenueCatService();
