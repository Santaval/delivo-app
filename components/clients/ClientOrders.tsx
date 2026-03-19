import useCustomerOrders from "@/hooks/useCustomerOrders";
import { router } from "expo-router";
import React from "react";
import { OrdersList } from "../OrdersList";

type Props = {
  clientId: string;
};

export default function ClientOrders(props: Props) {
  const { clientId } = props;

  const { orders, loading, refreshOrders } = useCustomerOrders(clientId);

  return (
    <OrdersList
      orders={orders}
      isRefreshing={loading}
      onRefresh={refreshOrders}
      onOrderPress={(orderId) => router.push(`/orders/view/${orderId}`)}
    />
  );
}
