import { pollForCreditIncrease } from "../pollCredits";

const status = (balance: number): CreditsStatus => ({
  balance,
  overdraftFloor: -5,
  lowBalanceThreshold: 10,
  packs: [],
});

const base = { companyId: "c1", baseline: 10, intervalMs: 1000, timeoutMs: 20000 };

describe("pollForCreditIncrease", () => {
  it("returns credited once the balance rises (3rd poll)", async () => {
    const fetch = jest
      .fn()
      .mockResolvedValueOnce(status(10))
      .mockResolvedValueOnce(status(10))
      .mockResolvedValueOnce(status(110));
    const sleep = jest.fn().mockResolvedValue(undefined);
    const result = await pollForCreditIncrease({ ...base, fetch, sleep, isCancelled: () => false });
    expect(result).toEqual({ status: "credited", balance: 110 });
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch).toHaveBeenCalledWith("c1");
  });

  it("times out when the balance never changes", async () => {
    const fetch = jest.fn().mockResolvedValue(status(10));
    const sleep = jest.fn().mockResolvedValue(undefined);
    const result = await pollForCreditIncrease({ ...base, fetch, sleep, isCancelled: () => false });
    expect(result).toEqual({ status: "timeout" });
    expect(fetch).toHaveBeenCalledTimes(20);
  });

  it("stops when cancelled", async () => {
    const fetch = jest.fn().mockResolvedValue(status(10));
    let cancelled = false;
    const sleep = jest.fn().mockImplementation(async () => {
      if (sleep.mock.calls.length === 2) cancelled = true;
    });
    const result = await pollForCreditIncrease({ ...base, fetch, sleep, isCancelled: () => cancelled });
    expect(result).toEqual({ status: "cancelled" });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("retries after fetch errors", async () => {
    const fetch = jest
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(status(60));
    const sleep = jest.fn().mockResolvedValue(undefined);
    const result = await pollForCreditIncrease({ ...base, fetch, sleep, isCancelled: () => false });
    expect(result).toEqual({ status: "credited", balance: 60 });
  });
});
