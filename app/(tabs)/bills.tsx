import { SearchBar, TopBar } from '@/components';
import { BillsList } from '@/components/bills/BillsList';
import { Routes, Spacing } from '@/constants';
import useBills from '@/hooks/useBills';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Bills() {
  const { bills, loading, error, refresh, search } = useBills();
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

      <BillsList
        onOrderPress={(orderId) => router.push(Routes.billView(orderId))}
        orders={bills}
        isRefreshing={loading && bills.length > 0}
        loading={loading && bills.length === 0}
        error={error}
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
