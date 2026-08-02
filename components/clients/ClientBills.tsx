import { Routes } from "@/constants";
import useCustomerBills from "@/hooks/useCustomerBills";
import { router } from "expo-router";
import React from "react";
import { BillsList } from "../bills/BillsList";

type Props = {
  clientId: string;
};

export default function ClientBills(props: Props) {
  const { clientId } = props;

  const { bills, loading, refreshBills } = useCustomerBills(clientId);

  return (
    <BillsList
      orders={bills}
      isRefreshing={loading}
      onRefresh={refreshBills}
      onOrderPress={(orderId) => router.push(Routes.billView(orderId))}
    />
  );
}
