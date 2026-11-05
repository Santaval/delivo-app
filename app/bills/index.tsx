import { SearchBar, TopBar } from '@/components';
import { BillsList } from '@/components/bills/BillsList';
import { Routes, Spacing } from '@/constants';
import useBills from '@/hooks/useBills';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Bills() {
  const {
    bills,
    counts,
    status,
    setStatus,
    search,
    loading,
    refreshing,
    loadingMore,
    error,
    refresh,
    loadMore,
  } = useBills('PENDING');
  const { t } = useTranslation();

  const openBill = useCallback((orderId: string) => router.push(Routes.billView(orderId)), []);

  return (
    <SafeAreaView style={styles.container}>
      <TopBar
        title={t('bills')}
        showBack
        backTo={Routes.home}
      />

      <SearchBar
        placeholder={t('searchByNameOrNumber')}
        onSearch={search}
        showClearButton
      />

      <BillsList
        orders={bills}
        status={status}
        onStatusChange={setStatus}
        counts={counts}
        onOrderPress={openBill}
        isRefreshing={refreshing}
        loading={loading}
        error={error}
        onRefresh={refresh}
        onEndReached={loadMore}
        loadingMore={loadingMore}
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
