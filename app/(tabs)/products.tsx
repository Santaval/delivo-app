import { FloatingActionButton, TopBar } from "@/components";
import { ProductsList } from "@/components/products/ProductsList";
import { SearchBar } from "@/components/SearchBar";
import { ThemedView } from "@/components/ThemedView";
import { Routes, Spacing, Typography } from "@/constants";
import { useThemeColor } from "@/hooks/useColorScheme";
import useProducts from "@/hooks/useProducts";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Products() {
  const { products, isInitialLoading, isRefreshing, error, refresh, searchProducts } = useProducts();
  const colors = useThemeColor();
  const { t } = useTranslation();

  const handlePress = (productId: string) => {
    router.push(Routes.productView(productId));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <TopBar title={t('products')} />

      <ThemedView style={{ flex: 1 }}>
        {/* Search Section */}
        <View style={[styles.searchContainer, { borderBottomColor: colors.border }]}>
          <SearchBar
            placeholder={t("searchProducts")}
            onSearch={searchProducts}
          />
        </View>

        {/* Content */}
        <ProductsList
          products={products}
          onProductPress={handlePress}
          isRefreshing={isRefreshing}
          loading={isInitialLoading}
          error={error}
          onRefresh={refresh}
          onCreateFirst={() => router.push(Routes.productsAdd)}
        />
      </ThemedView>
      <FloatingActionButton
        icon="add"
        onPress={() => router.push(Routes.productsAdd)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  searchContainer: {
    borderBottomWidth: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  totalContainer: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  totalText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  productsList: {
    paddingHorizontal: Spacing.lg,
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
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.sm,
    textAlign: "center",
    lineHeight: 20,
  },
});
