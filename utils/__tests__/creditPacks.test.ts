import { formatPrice, matchCreditPackages } from "../creditPacks";

const pkg = (identifier: string, price: number, currencyCode = "USD") =>
  ({ product: { identifier, price, currencyCode, priceString: `$${price}` } }) as any;

const packs: CreditPack[] = [
  { productId: "delivo_bills_100", credits: 100 },
  { productId: "delivo_bills_500", credits: 500 },
];

describe("matchCreditPackages", () => {
  it("matches packages with API packs and computes price per bill", () => {
    const [opt] = matchCreditPackages([pkg("delivo_bills_100", 10)], packs);
    expect(opt.credits).toBe(100);
    expect(opt.pricePerBill).toBeCloseTo(0.1);
    expect(opt.currencyCode).toBe("USD");
  });

  it("hides products the API does not know", () => {
    expect(matchCreditPackages([pkg("other_product", 5)], packs)).toEqual([]);
  });

  it("sorts by credits ascending", () => {
    const result = matchCreditPackages(
      [pkg("delivo_bills_500", 40), pkg("delivo_bills_100", 10)],
      packs,
    );
    expect(result.map((o) => o.credits)).toEqual([100, 500]);
  });

  it("tolerates a ':basePlan' suffix", () => {
    const result = matchCreditPackages([pkg("delivo_bills_100:base", 10)], packs);
    expect(result).toHaveLength(1);
    expect(result[0].credits).toBe(100);
  });

  it("returns nothing without packs", () => {
    expect(matchCreditPackages([pkg("delivo_bills_100", 10)], [])).toEqual([]);
  });
});

describe("formatPrice", () => {
  it("formats currency", () => {
    expect(formatPrice(0.1, "USD", "en")).toContain("0.10");
  });

  it("falls back on an invalid currency code", () => {
    expect(formatPrice(1.5, "??", "en")).toBe("?? 1.50");
  });
});
