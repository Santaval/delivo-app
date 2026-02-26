import { FloatingActionButton, TopBar } from '@/components';
import ProductCard from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import useProducts from '@/hooks/useProducts';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Products() {
  const colors = useThemeColor();
  const { products, loading, error, refresh } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditProduct = (productId: string) => {
    // TODO: Navigate to edit product screen
    console.log('Edit product:', productId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title='Products' />
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <ThemedView style={styles.container}>
        {/* Search Section */}
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder={t("searchProducts")}
            onSearch={setSearchQuery}
            initialValue={searchQuery}
          />
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        >
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>{t("stockItems")}</ThemedText>
            <View style={styles.totalContainer}>
              <ThemedText style={styles.totalText}>{filteredProducts.length} Total</ThemedText>
            </View>
          </View>
          

          {/* Product Cards */}
          <View style={styles.productsList}>
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                item={product} 
                onEdit={handleEditProduct}
              />
            ))}
          </View>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialIcons 
                name="inventory-2" 
                size={64} 
                color={colors.textTertiary || Colors.light.textTertiary} 
              />
              <ThemedText style={styles.emptyTitle}>
                {searchQuery ? 'No products found' : 'No products yet'}
              </ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                {searchQuery 
                  ? `No products match "${searchQuery}"`
                  : 'Add your first product to get started'
                }
              </ThemedText>
            </View>
          )}
        
        </ScrollView>
      </ThemedView>
      <FloatingActionButton
          icon="add"
          onPress={() => router.push('/products/add')}
        />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.background,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});