export type PollCreditsResult =
  | { status: "credited"; balance: number }
  | { status: "timeout" }
  | { status: "cancelled" };

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * After a store purchase the credits arrive through a server-side webhook. Polls the balance
 * until it rises above `baseline`. Fetch errors are retried until the timeout.
 */
export async function pollForCreditIncrease(opts: {
  companyId: string;
  baseline: number;
  fetch: (companyId: string) => Promise<CreditsStatus>;
  intervalMs?: number;
  timeoutMs?: number;
  isCancelled: () => boolean;
  sleep?: (ms: number) => Promise<void>;
}): Promise<PollCreditsResult> {
  const { companyId, baseline, fetch, isCancelled } = opts;
  const intervalMs = opts.intervalMs ?? 1500;
  const timeoutMs = opts.timeoutMs ?? 20000;
  const sleep = opts.sleep ?? defaultSleep;

  let elapsed = 0;
  while (elapsed < timeoutMs) {
    await sleep(intervalMs);
    elapsed += intervalMs;
    if (isCancelled()) return { status: "cancelled" };
    try {
      const status = await fetch(companyId);
      if (isCancelled()) return { status: "cancelled" };
      if (status.balance > baseline) return { status: "credited", balance: status.balance };
    } catch {
      // Transient failure: keep polling until the timeout.
    }
  }
  return { status: "timeout" };
}
