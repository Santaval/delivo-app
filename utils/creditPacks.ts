import type { PurchasesPackage } from "react-native-purchases";

export type CreditPackOption = {
  pkg: PurchasesPackage;
  credits: number;
  pricePerBill: number;
  currencyCode: string;
};

/**
 * Matches store packages against the packs the API will credit. Products the API does not
 * know are dropped (never sell what the backend won't grant). Sorted by credits ascending.
 */
export function matchCreditPackages(
  packages: PurchasesPackage[],
  packs: CreditPack[],
): CreditPackOption[] {
  const options: CreditPackOption[] = [];
  for (const pkg of packages) {
    const identifier = pkg.product.identifier;
    // Android ids can come as "productId:basePlan"; tolerate the suffix.
    const pack =
      packs.find((p) => p.productId === identifier) ??
      packs.find((p) => p.productId === identifier.split(":")[0]);
    if (!pack || pack.credits <= 0) continue;
    options.push({
      pkg,
      credits: pack.credits,
      pricePerBill: pkg.product.price / pack.credits,
      currencyCode: pkg.product.currencyCode,
    });
  }
  return options.sort((a, b) => a.credits - b.credits);
}

export function formatPrice(amount: number, currencyCode: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}
