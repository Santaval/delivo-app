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

/**
 * The app never uses an anonymous RevenueCat app user ID
 * (https://github.com/Santaval/delivo-app/issues/77).
 *
 * Anonymous IDs post the device receipt, and RevenueCat aliases them into
 * whichever customer already owns that receipt. A later `logIn(companyId)` from
 * an anonymous ID then aliases the new company into that same customer, so
 * purchases get reported under the wrong app_user_id. To avoid this the SDK is
 * only configured once a company is known (with that company as appUserID) and
 * afterwards only switches identified -> identified, which never aliases.
 * There is deliberately no `logOut()`.
 */
class RevenueCatService {
  private configured = false;

  /** `companyId` is the active company id — credits belong to a company, not a user. */
  async identify(companyId: string): Promise<void> {
    if (!this.configured) {
      const apiKey =
        Platform.OS === "ios"
          ? config.revenueCatIosKey
          : config.revenueCatAndroidKey;

      if (config.isDevelopment) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      Purchases.configure({ apiKey, appUserID: companyId });
      this.configured = true;
      return;
    }

    if ((await Purchases.getAppUserID()) !== companyId) {
      await Purchases.logIn(companyId);
    }
  }

  isConfigured(): boolean {
    return this.configured;
  }

  /** The SDK's current app user id, or null if it has not been configured yet. */
  async currentAppUserId(): Promise<string | null> {
    if (!this.configured) return null;
    return Purchases.getAppUserID();
  }

  private assertConfigured(): void {
    if (!this.configured) {
      throw new Error(
        "RevenueCat is not configured: call identify(companyId) first",
      );
    }
  }

  /**
   * Fetched by identifier, not `offerings.current`, so the dashboard can keep the
   * legacy offering as Current while old store builds are still in use.
   */
  async getCreditsOffering(): Promise<PurchasesOffering | null> {
    this.assertConfigured();
    const offerings = await Purchases.getOfferings();
    return offerings.all[OFFERING_IDENTIFIERS.CREDITS] ?? null;
  }

  /** Purchases a consumable; credits are granted server-side by the webhook. */
  async purchasePackage(pkg: PurchasesPackage): Promise<void> {
    this.assertConfigured();
    await Purchases.purchasePackage(pkg);
  }
}

export default new RevenueCatService();
