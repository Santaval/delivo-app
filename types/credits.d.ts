type CreditLedgerReason =
  | "WELCOME_GRANT"
  | "PURCHASE"
  | "BILL_ISSUED"
  | "REFUND"
  | "ADMIN_ADJUSTMENT";

interface CreditPack {
  productId: string;
  credits: number;
}

interface CreditsStatus {
  balance: number;
  overdraftFloor: number;
  lowBalanceThreshold: number;
  packs: CreditPack[];
}

interface CreditLedgerEntry {
  id: string;
  /** Known reasons are listed in CreditLedgerReason; unknown ones must still render. */
  reason: CreditLedgerReason | string;
  delta: number;
  balanceAfter: number;
  createdAt: string;
  billId: string | null;
  billNumber: number | null;
  productId: string | null;
  note: string | null;
}

interface CreditLedgerPage {
  data: CreditLedgerEntry[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}
