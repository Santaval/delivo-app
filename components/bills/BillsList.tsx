import { Spacing } from "@/constants";
import { useThemeColor } from "@/hooks/useColorScheme";
import { FlashList } from "@shopify/flash-list";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, RefreshControl, StyleSheet, View } from "react-native";
import { EmptyState } from "../feedback/EmptyState";
import { ErrorState } from "../feedback/ErrorState";
import { ListSkeleton } from "../feedback/Skeleton";
import { ThemedView } from "../ThemedView";
import { BillCard } from "./BillCard";
import { BillStatusTabs } from "./BillStatusTabs";

export type BillListProps = {
  orders: Order[];
  status: BillsStatusFilter;
  onStatusChange: (status: BillsStatusFilter) => void;
  counts?: Partial<BillsCounts> | null;
  onOrderPress?: (orderId: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  /** First page is loading: shows the skeleton instead of the list. */
  loading?: boolean;
  error?: string | null;
  /** Called near the end of the list to fetch the next page. */
  onEndReached?: () => void;
  loadingMore?: boolean;
};

/** Virtualized, infinitely scrolling list of bills with payment-status tabs. */
export function BillsList({
  orders,
  status,
  onStatusChange,
  counts,
  onOrderPress,
  onRefresh,
  isRefreshing,
  loading,
  error,
  onEndReached,
  loadingMore,
}: BillListProps) {
  const colors = useThemeColor();
  const { t } = useTranslation();

  const renderItem = useCallback(
    ({ item }: { item: Order }) => <BillCard order={item} onPress={onOrderPress} />,
    [onOrderPress],
  );

  const renderBody = () => {
    if (loading) return <ListSkeleton />;
    if (error && orders.length === 0) return <ErrorState message={error} onRetry={onRefresh} />;

    return (
      <FlashList
        data={orders}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={ItemSeparator}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="receipt"
            title={t("noBillsYet")}
            subtitle={status === "ALL" ? t("noBillsYetSubtitle") : undefined}
          />
        }
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
    <ThemedView style={styles.container}>
      <BillStatusTabs value={status} onChange={onStatusChange} counts={counts} />
      <View style={styles.listContainer}>{renderBody()}</View>
    </ThemedView>
  );
}

const keyExtractor = (order: Order) => order.id;

const ItemSeparator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  listContainer: {
    flex: 1,
  },
  separator: {
    height: Spacing.sm,
  },
  footer: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
});
