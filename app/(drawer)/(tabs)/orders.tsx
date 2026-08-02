import { FloatingActionButton, SearchBar, TopBar } from '@/components';
import { OrdersList } from '@/components/OrdersList';
import { Routes, Spacing } from '@/constants';
import { useDrawer } from '@/hooks';
import useOrders from '@/hooks/useOrders';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Orders() {
  const { orders, isInitialLoading, isRefreshing, error, refresh, search } = useOrders();
  const { t } = useTranslation();
  const { openDrawer } = useDrawer();

  const handleAddOrder = () => {
    router.push(Routes.ordersCreate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar
        title={t('orders')}
        onMenuPress={openDrawer}
      />

      <SearchBar
        placeholder={t('searchByNameOrNumber')}
        onSearch={search}
        showClearButton
      />

      <OrdersList
        onOrderPress={(orderId) => router.push(Routes.orderView(orderId))}
        orders={orders}
        isRefreshing={isRefreshing}
        loading={isInitialLoading}
        error={error}
        onRefresh={refresh}
        onCreateFirst={handleAddOrder}
      />
      
      <FloatingActionButton
        onPress={handleAddOrder}
        icon="add"
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
});
