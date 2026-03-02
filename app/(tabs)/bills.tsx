import { SearchBar, TopBar } from '@/components';
import { OrdersList } from '@/components/OrdersList';
import { Spacing } from '@/constants';
import useBills from '@/hooks/useBills';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Clients() {
  const { bills, loading, refresh, search } = useBills();
  const { t } = useTranslation();


  return (
    <SafeAreaView style={styles.container}>
      <TopBar
        title={t('bills')}
      />

      <SearchBar
        placeholder={t('searchByNameOrNumber')}
        onSearch={search}
        showClearButton
      />

      <OrdersList 
        onOrderPress={(orderId) => router.push(`/orders/view/${orderId}`)}
        orders={bills}
        isRefreshing={loading}
        onRefresh={refresh}
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
