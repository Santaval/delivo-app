import { LoadingState, PrimaryButton, ThemedText, ThemedView, TopBar } from "@/components";
import {
    ProductDetailActions,
    ProductDetailHeader,
    ProductMetaCard,
    ProductPricingCard,
} from "@/components/products";
import { ProductsViewParams, Routes, Spacing, Typography } from "@/constants";
import { Colors } from "@/constants/Colors";
import { useToast } from "@/context/ToastContext";
import { useThemeColor } from "@/hooks/useColorScheme";
import useProduct from "@/hooks/useProduct";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<ProductsViewParams>();
  const colors = useThemeColor();
  const { t } = useTranslation();
  const toast = useToast();
  const { product, loading, error, refresh, remove } = useProduct(id);

  const handleEdit = () => {
    router.push(Routes.productEdit(id));
  };

  const handleDelete = async () => {
    try {
      await remove();
      toast.show({ message: t('productDeletedSuccessfully'), type: 'success' });
      router.back();
    } catch (err) {
      toast.show({ message: t("failedToDeleteProduct"), type: 'error' });
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <TopBar title={t("productDetail")} />
        <LoadingState message={t('loading')} />
      </ThemedView>
    );
  }

  if (error || !product) {
    return (
      <ThemedView style={styles.container}>
        <TopBar title={t("productDetail")} />
        <View style={styles.centerContent}>
          <MaterialIcons name="error-outline" size={48} color={colors.danger} />
          <ThemedText style={[styles.errorText, { color: colors.danger }]}>
            {error || t("productNotFound")}
          </ThemedText>
          <PrimaryButton
            title={t("retry")}
            onPress={refresh}
            style={styles.retryButton}
          />
        </View>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title={t("productDetail")} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ProductDetailHeader
          name={product.name}
          totalPrice={product.pricing.totalPrice}
        />

        <ProductPricingCard
          netPrice={product.pricing.netPrice}
          ivaRate={product.pricing.ivaRate}
          ivaAmount={product.pricing.ivaAmount}
          totalPrice={product.pricing.totalPrice}
        />

        <ProductMetaCard
          createdAt={product.createdAt}
          updatedAt={product.updatedAt}
        />

        <ProductDetailActions
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl * 4,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    textAlign: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
  },
});
