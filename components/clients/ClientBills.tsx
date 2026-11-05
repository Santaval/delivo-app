import { Routes, Spacing } from "@/constants";
import useCustomerBills from "@/hooks/useCustomerBills";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { BillCard } from "../bills/BillCard";
import { BillStatusTabs } from "../bills/BillStatusTabs";
import { EmptyState } from "../feedback/EmptyState";
import { ListSkeleton } from "../feedback/Skeleton";

type Props = {
  clientId: string;
};

/**
 * A single client's bills. Rendered inside the profile's ScrollView, so this is a plain
 * (non-virtualized) list — a client's bill count is small enough not to need FlashList.
 */
export default function ClientBills(props: Props) {
  const { clientId } = props;
  const { t } = useTranslation();
  const { bills, loading } = useCustomerBills(clientId);
  const [status, setStatus] = useState<BillsStatusFilter>("ALL");

  const counts = useMemo<BillsCounts>(() => {
    const result: BillsCounts = { ALL: bills.length, PENDING: 0, PAID: 0, CANCELLED: 0 };
    for (const bill of bills) result[bill.status] += 1;
    return result;
  }, [bills]);

  const filtered = useMemo(
    () => (status === "ALL" ? bills : bills.filter((bill) => bill.status === status)),
    [bills, status],
  );

  const openBill = (orderId: string) => router.push(Routes.billView(orderId));

  return (
    <View>
      <BillStatusTabs value={status} onChange={setStatus} counts={counts} />
      {loading ? (
        <ListSkeleton />
      ) : filtered.length > 0 ? (
        <View style={styles.list}>
          {filtered.map((bill) => (
            <BillCard key={bill.id} order={bill} onPress={openBill} />
          ))}
        </View>
      ) : (
        <EmptyState
          icon="receipt"
          title={t("noBillsYet")}
          subtitle={status === "ALL" ? t("noBillsYetSubtitle") : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
});
