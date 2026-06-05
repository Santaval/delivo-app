import { BorderRadius, Shadows, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import useProducts from '@/hooks/useProducts';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export type OrderItem = {
  product: Product;
  quantity: number;
  totalPrice: number;
};

export type ProductSelectProps = {
  label?: string;
  disableTotal?: boolean;
  placeholder?: string;
  onProductsChange: (orderItems: OrderItem[]) => void;
  error?: string;
  style?: any;
  maxItems?: number;
};

type ProductListItemProps = {
  item: Product;
  onPress: (product: Product) => void;
  selectedQuantity?: number;
};

const ProductListItem: React.FC<ProductListItemProps> = ({ item, onPress, selectedQuantity, }) => {
  const colors = useThemeColor();
  
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const getProductIcon = (productName: string) => {
    const name = productName.toLowerCase();
    if (name.includes('design') || name.includes('ui/ux')) return 'design-services';
    if (name.includes('development') || name.includes('software')) return 'code';
    if (name.includes('consulting') || name.includes('advice')) return 'psychology';
    if (name.includes('marketing') || name.includes('seo')) return 'campaign';
    return 'inventory';
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.productItem,
        { 
          backgroundColor: selectedQuantity ? colors.primaryLight : 'transparent',
          borderColor: selectedQuantity ? colors.primary : colors.border 
        }
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.productIcon, { backgroundColor: colors.primary }]}>
        <MaterialIcons 
          name={getProductIcon(item.name)} 
          size={20} 
          color={colors.textInverse} 
        />
      </View>
      
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.productPrice, { color: colors.textSecondary }]}>
          {formatPrice(item.pricing.totalPrice)}
          {item.pricing.ivaRate > 0 && (
            <Text style={styles.ivaText}> (Incl. IVA)</Text>
          )}
        </Text>
      </View>
      
      {selectedQuantity && (
        <View style={[styles.quantityBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.quantityText, { color: colors.textInverse }]}>
            {selectedQuantity}
          </Text>
        </View>
      )}
      
      <MaterialIcons
        name="add-circle-outline"
        size={24}
        color={selectedQuantity ? colors.primary : colors.textSecondary}
      />
    </TouchableOpacity>
  );
};

type OrderItemCardProps = {
  orderItem: OrderItem;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
};

const OrderItemCard: React.FC<OrderItemCardProps> = ({ orderItem, onQuantityChange, onRemove }) => {
  const colors = useThemeColor();
  
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = orderItem.quantity + change;
    if (newQuantity <= 0) {
      onRemove(orderItem.product.id);
    } else {
      onQuantityChange(orderItem.product.id, newQuantity);
    }
  };

  return (
    <View style={[styles.orderItemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.orderItemHeader}>
        <Text style={[styles.orderItemName, { color: colors.text }]}>
          {orderItem.product.name}
        </Text>
        <TouchableOpacity
          onPress={() => onRemove(orderItem.product.id)}
          style={styles.removeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="close" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.orderItemControls}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            onPress={() => handleQuantityChange(-1)}
            style={[styles.quantityButton, { borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <MaterialIcons name="remove" size={18} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[styles.quantityDisplay, { color: colors.text }]}>
            Qty: {orderItem.quantity}
          </Text>
          
          <TouchableOpacity
            onPress={() => handleQuantityChange(1)}
            style={[styles.quantityButton, { borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <MaterialIcons name="add" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.orderItemTotal, { color: colors.primary }]}>
          {formatPrice(orderItem.totalPrice)}
        </Text>
      </View>
    </View>
  );
};

export function ProductSelect({
  label = "PRODUCTS",
  placeholder = "Add products to your order...",
  onProductsChange,
  disableTotal,
  error,
  style,
  maxItems = 50,
}: ProductSelectProps) {
  const colors = useThemeColor();
  const { products, loading } = useProducts();
  const { t } = useTranslation();

  const [selectedProducts, setSelectedProducts] = useState<OrderItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Filter products based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  // Notify parent component when products change
  useEffect(() => {
    onProductsChange(selectedProducts);
  }, [selectedProducts, onProductsChange]);

  const calculateOrderItemTotal = (product: Product, quantity: number): number => {
    return product.pricing.totalPrice * quantity;
  };

  const getTotalOrderValue = (): number => {
    return selectedProducts.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getSelectedQuantity = (productId: string): number | undefined => {
    const selectedItem = selectedProducts.find(item => item.product.id === productId);
    return selectedItem?.quantity;
  };

  const handleProductSelect = useCallback((product: Product) => {
    const existingItemIndex = selectedProducts.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Product already selected, increase quantity
      const updatedItems = [...selectedProducts];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].totalPrice = calculateOrderItemTotal(
        product, 
        updatedItems[existingItemIndex].quantity
      );
      setSelectedProducts(updatedItems);
    } else {
      // New product selection
      if (selectedProducts.length >= maxItems) {
        Alert.alert(t('maximumItems'), t('maxItemsMessage', { maxItems }));
        return;
      }
      
      const newOrderItem: OrderItem = {
        product,
        quantity: 1,
        totalPrice: calculateOrderItemTotal(product, 1),
      };
      setSelectedProducts(prev => [...prev, newOrderItem]);
    }
    
    setIsModalVisible(false);
  }, [selectedProducts, maxItems]);

  const handleQuantityChange = useCallback((productId: string, newQuantity: number) => {
    setSelectedProducts(prev => prev.map(item => 
      item.product.id === productId 
        ? {
            ...item,
            quantity: newQuantity,
            totalPrice: calculateOrderItemTotal(item.product, newQuantity)
          }
        : item
    ));
  }, []);

  const handleRemoveProduct = useCallback((productId: string) => {
    setSelectedProducts(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSearchQuery('');
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <ProductListItem
      item={item}
      onPress={handleProductSelect}
      selectedQuantity={getSelectedQuantity(item.id)}
    />
  );

  const hasError = !!error;
  const totalValue = getTotalOrderValue();

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <View style={styles.labelContainer}>
          <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
            {label}
          </ThemedText>
          <View style={styles.labelRight}>
            {selectedProducts.length > 0 && (
              <ThemedText style={[styles.itemCount, { color: colors.primary }]}>
                {selectedProducts.length} item{selectedProducts.length !== 1 ? 's' : ''}
              </ThemedText>
            )}
            <TouchableOpacity onPress={openModal} style={styles.addButton}>
              <MaterialIcons name="add" size={16} color={colors.primary} />
              <ThemedText style={[styles.addButtonText, { color: colors.primary }]}>
                {t("addProduct")}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Selected Products List */}
      {selectedProducts.length > 0 ? (
        <View style={[styles.selectedProductsContainer]}>
          {selectedProducts.map(orderItem => (
            <OrderItemCard
              key={orderItem.product.id}
              orderItem={orderItem}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemoveProduct}
            />
          ))}
          
          {/* Total */}
          {!disableTotal && (
            <View style={[styles.totalContainer, { borderTopColor: colors.border }]}>
              <ThemedText style={[styles.totalLabel, { color: colors.text }]}>
                Total Order Value:
              </ThemedText>
              <ThemedText style={[styles.totalValue, { color: colors.primary }]}>
                ₡{totalValue.toFixed(2)}
              </ThemedText>
            </View>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.emptyContainer,
            {
              borderColor: hasError ? colors.danger : colors.border,
              backgroundColor: colors.surface,
            },
          ]}
          onPress={openModal}
          activeOpacity={0.7}
        >
          <MaterialIcons name="add-shopping-cart" size={24} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {placeholder}
          </Text>
        </TouchableOpacity>
      )}

      {/* Error Message */}
      {hasError && (
        <ThemedText style={[styles.errorText, { color: colors.danger }]}>
          {error}
        </ThemedText>
      )}

      {/* Product Selection Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <ThemedView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
              {t("addProduct")}
            </ThemedText>
            <View style={styles.placeholder} />
          </View>

          {/* Search Input */}
          <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
            <MaterialIcons
              name="search"
              size={20}
              color={colors.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={[
                styles.searchInput,
                {
                  color: colors.text,
                  fontSize: Typography.fontSize.base,
                },
              ]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t("searchProducts")}
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.searchClearButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons
                  name="close"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Product List */}
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            style={styles.productList}
            contentContainerStyle={styles.productListContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyModalContainer}>
                <MaterialIcons
                  name="inventory-2"
                  size={48}
                  color={colors.textSecondary}
                />
                <ThemedText style={[styles.emptyModalText, { color: colors.textSecondary }]}>
                  {loading ? 'Loading products...' : 'No products found'}
                </ThemedText>
                {searchQuery && (
                  <ThemedText style={[styles.emptyModalSubtext, { color: colors.textSecondary }]}>
                    Try adjusting your search terms
                  </ThemedText>
                )}
              </View>
            )}
          />
        </ThemedView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  itemCount: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  selectedProductsContainer: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  emptyContainer: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        paddingTop: Spacing.xl + 20,
      },
      android: {
        paddingTop: Spacing.xl,
      },
    }),
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : Spacing.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  searchClearButton: {
    marginLeft: Spacing.sm,
    padding: 2,
  },
  productList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  productListContent: {
    paddingBottom: Spacing.xl,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: Typography.fontSize.xs,
  },
  ivaText: {
    fontStyle: 'italic',
  },
  quantityBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  quantityText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  orderItemCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    ...Shadows.small,
  },
  orderItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  orderItemName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
  },
  removeButton: {
    padding: 2,
  },
  orderItemControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityDisplay: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    minWidth: 60,
    textAlign: 'center',
  },
  orderItemTotal: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  totalValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  emptyModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyModalText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  emptyModalSubtext: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
