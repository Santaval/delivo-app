import { FloatingActionButton, TopBar } from "@/components";
import { ProductsList } from "@/components/products/ProductsList";
import { SearchBar } from "@/components/SearchBar";
import { ThemedView } from "@/components/ThemedView";
import { Colors, Spacing, Typography } from "@/constants";
import { useThemeColor } from "@/hooks/useColorScheme";
import useProducts from "@/hooks/useProducts";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  StatusBar,
  StyleSheet,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Products() {
  const colors = useThemeColor();
  const { products, loading, error, refresh } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();

  // Filter products based on search query
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handlePress = (productId: string) => {
    router.push({
      pathname: "/products/view/[id]",
      params: { id: productId }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title={t('products')} />
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ThemedView style={{ flex: 1 }}>
        {/* Search Section */}
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder={t("searchProducts")}
            onSearch={setSearchQuery}
            initialValue={searchQuery}
          />
        </View>

        {/* Content */}
        <ProductsList
          products={filteredProducts}
          onProductPress={handlePress}
          isRefreshing={loading}
          onRefresh={refresh}
        />
      </ThemedView>
      <FloatingActionButton
        icon="add"
        onPress={() => router.push("/products/add")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  searchContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
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
    backgroundColor: Colors.light.backgroundSecondary,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.textSecondary,
    letterSpacing: 0.5,
  },
  totalContainer: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  totalText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.textSecondary,
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
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
