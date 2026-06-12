import { FloatingActionButton, SearchBar, TopBar } from '@/components';
import { OrdersList } from '@/components/OrdersList';
import { Spacing } from '@/constants';
import useOrders from '@/hooks/useOrders';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Orders() {
  const { orders, loading, error, refresh, search } = useOrders();
  const { t } = useTranslation();

  const handleAddOrder = () => {
    router.push('/orders/create');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar
        title={t('orders')}
      />

      <SearchBar
        placeholder={t('searchByNameOrNumber')}
        onSearch={search}
        showClearButton
      />

      <OrdersList
        onOrderPress={(orderId) => router.push(`/orders/view/${orderId}`)}
        orders={orders}
        isRefreshing={loading && orders.length > 0}
        loading={loading && orders.length === 0}
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
