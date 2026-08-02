import { FloatingActionButton, TopBar } from "@/components";
import { ProductsList } from "@/components/products/ProductsList";
import { SearchBar } from "@/components/SearchBar";
import { ThemedView } from "@/components/ThemedView";
import { Routes, Spacing } from "@/constants";
import useProducts from "@/hooks/useProducts";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Products() {
  const {
    products,
    isInitialLoading,
    isRefreshing,
    error,
    refresh,
    searchProducts,
  } = useProducts();
  const { t } = useTranslation();

  const handlePress = (productId: string) => {
    router.push(Routes.productView(productId));
  };

  return (
    <SafeAreaView style={[styles.container]}>
      <TopBar title={t("products")} showBack backTo={Routes.home} />

      <ThemedView style={{ flex: 1, backgroundColor: "transparent" }}>
        {/* Search Section */}
        <View>
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
      {/* No default `bottom` here: the tab bar it used to clear is gone on
          this screen, since products now lives in the drawer. */}
      <FloatingActionButton
        icon="add"
        onPress={() => router.push(Routes.productsAdd)}
        bottom={Spacing['3xl']}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
});
