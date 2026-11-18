import { EmptyState, ErrorState, ListSkeleton, ThemedText, TopBar } from '@/components';
import { CreditLedgerRow } from '@/components/credits/CreditLedgerRow';
import { Spacing, Typography } from '@/constants';
import { useCredits } from '@/context/CreditsContext';
import useCreditLedger from '@/hooks/useCreditLedger';
import { useThemeColor } from '@/hooks/useColorScheme';
import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const keyExtractor = (entry: CreditLedgerEntry) => entry.id;
const ItemSeparator = () => <View style={styles.separator} />;

export default function CreditsHistory() {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const { balance } = useCredits();
  const { entries, loading, refreshing, loadingMore, error, refresh, loadMore } = useCreditLedger();

  const renderItem = useCallback(
    ({ item }: { item: CreditLedgerEntry }) => <CreditLedgerRow entry={item} />,
    [],
  );

  const renderBody = () => {
    if (loading) return <ListSkeleton />;
    if (error && entries.length === 0) return <ErrorState message={error} onRetry={refresh} />;

    return (
      <FlashList
        data={entries}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={ItemSeparator}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={<EmptyState icon="receipt-long" title={t('creditsHistoryEmpty')} />}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title={t('creditsHistoryTitle')} />

      {balance !== null && (
        <View style={styles.balanceHeader}>
          <ThemedText variant="caption">{t('creditsTitle')}</ThemedText>
          <ThemedText style={styles.balance}>{balance}</ThemedText>
        </View>
      )}

      <View style={styles.list}>{renderBody()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  balanceHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  balance: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: Typography.fontWeight.bold,
  },
  list: {
    flex: 1,
  },
  separator: {
    height: Spacing.sm,
  },
  footer: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
});
