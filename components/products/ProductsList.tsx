import { ThemedView } from "@/components/ThemedView";
import { BorderRadius, Spacing, Typography } from "@/constants";
import { useTranslation } from "react-i18next";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { EmptyState } from "../feedback/EmptyState";
import { ErrorState } from "../feedback/ErrorState";
import { ListSkeleton } from "../feedback/Skeleton";
import ProductCard from "../ProductCard";

export type ProductsListProps = {
  products: Product[];
  onProductPress?: (productId: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  loading?: boolean;
  error?: string | null;
  onCreateFirst?: () => void;
};

export function ProductsList({
  products,
  onProductPress,
  onRefresh,
  isRefreshing,
  loading,
  error,
  onCreateFirst,
}: ProductsListProps) {
  const { t } = useTranslation();

  const renderEmptyState = () => (
    <EmptyState
      icon="inventory"
      title={t("noProductsYet")}
      subtitle={t("noProductsYetSubtitle")}
      actionLabel={onCreateFirst ? t("addProduct") : undefined}
      onAction={onCreateFirst}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.ordersContainer}
        contentContainerStyle={styles.ordersContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ListSkeleton />
        ) : error && products.length === 0 ? (
          <ErrorState message={error} onRetry={onRefresh} />
        ) : products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product.id}
              item={product}
              onPress={() => onProductPress?.(product.id)}
            />
          ))
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  tabsContainer: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  tabsContent: {
    gap: Spacing.sm,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  tabButtonActive: {
    // Active styles are handled inline with colors
  },
  tabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  tabTextActive: {
    fontWeight: Typography.fontWeight.semibold,
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  ordersContainer: {
    flex: 1,
  },
  ordersContent: {
    gap: Spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.sm,
    textAlign: "center",
    lineHeight: 20,
  },
});
