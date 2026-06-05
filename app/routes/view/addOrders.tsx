import { SwipeButton, TopBar } from '@/components';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants';
import useOrders from '@/hooks/useOrders';
import RoutesService from '@/services/routes/Routes.service';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function AddOrders() {
  const { t } = useTranslation();
  const { orders, loading, error } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isAddingToRoute, setIsAddingToRoute] = useState(false);

  const { routeId } = useLocalSearchParams<{ routeId: string }>();

  // Filter and search orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => !order.route) // Only show orders not already assigned to routes
      .filter(order => 
        searchQuery === '' || 
        order.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `INV-${order.number.toString().padStart(3, '0')}`.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [orders, searchQuery]);

  // Get pending orders (not assigned to routes)
  const pendingOrders = filteredOrders.filter(order => order.deliveryStatus === 'PENDING');

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const calculateTotalValue = () => {
    return Array.from(selectedOrders).reduce((total, orderId) => {
      const order = filteredOrders.find(o => o.id === orderId);
      return total + (order?.pricing.total || 0);
    }, 0);
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const generateInvoiceNumber = (orderNumber: number) => {
    return `INV-${orderNumber.toString().padStart(3, '0')}`;
  };

  const handleAddToRoute = async () => {
    if (selectedOrders.size === 0) {
      Alert.alert(t('noOrdersSelected'), t('selectAtLeastOneOrder'));
      return;
    }

    setIsAddingToRoute(true);
    try {
      
      const promises = Array.from(selectedOrders).map(orderId =>
        RoutesService.addPoint(routeId, orderId)
      );
      await Promise.all(promises);

    } catch (err) {
      Alert.alert(t('error'), t('failedToAddOrdersToRoute'));
    } finally {
      setIsAddingToRoute(false);
    }
  };

  const clearSelection = () => {
    setSelectedOrders(new Set());
  };

  const getOrderPriorityIcon = (order: Order) => {
    // Mock priority logic - you can customize this based on your business rules
    if (order.pricing.total > 500) return '⚠️'; // High value
    if (order.status === 'PENDING' && new Date(order.createdAt) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      return '🔺'; // Old pending order
    }
    return null;
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const isSelected = selectedOrders.has(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.orderItem,
          isSelected && styles.orderItemSelected
        ]}
        onPress={() => toggleOrderSelection(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.orderContent}>
          <View style={styles.checkboxContainer}>
            <View style={[
              styles.checkbox,
              isSelected && styles.checkboxSelected
            ]}>
              {isSelected && (
                <Ionicons name="checkmark" size={16} color={Colors.light.textInverse} />
              )}
            </View>
          </View>

          <View style={styles.orderInfo}>
            <View style={styles.orderHeader}>
              <Text style={styles.invoiceNumber}>
                {generateInvoiceNumber(item.number)} | {item.client.name}
              </Text>
              <Text style={styles.orderAmount}>
                {formatPrice(item.pricing.total)}
              </Text>
            </View>
            
      
            
            <View style={styles.orderFooter}>
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>
                  {item.status === 'PENDING' ? t('readyForPickup') : item.status}
                </Text>
              </View>
            
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={64} color={Colors.light.textTertiary} />
      <Text style={styles.emptyTitle}>{t('noOrdersAvailable')}</Text>
      <Text style={styles.emptyMessage}>
        {searchQuery ? t('noOrdersMatchSearch') : t('allOrdersAssigned')}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar title={t('addOrdersToRoute')} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>{t('loadingOrders')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar title={t('addOrdersToRoute')} />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title={t('addOrdersToRoute')} />
      
      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={Colors.light.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('searchByNameOrNumber')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.light.textSecondary}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close" size={20} color={Colors.light.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('pendingOrders')} ({pendingOrders.length})
          </Text>
          {selectedOrders.size > 0 && (
            <TouchableOpacity onPress={clearSelection}>
              <Text style={styles.clearButton}>{t('clearSelection')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Orders List */}
        <FlatList
          data={pendingOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          showsVerticalScrollIndicator={false}
          style={styles.ordersList}
          contentContainerStyle={pendingOrders.length === 0 ? styles.emptyListContent : undefined}
          ListEmptyComponent={renderEmptyState}
        />

        {/* Selection Summary & Add Button */}
        {selectedOrders.size > 0 && (
          <View style={styles.selectionSummary}>
            <View style={styles.summaryInfo}>
              <Text style={styles.selectionCount}>
                {selectedOrders.size} {selectedOrders.size !== 1 ? t('orders') : t('order')} {t('ordersSelected')}
              </Text>
              <Text style={styles.selectionTotal}>
                {t('totalValue')}: {formatPrice(calculateTotalValue())}
              </Text>
            </View>
            
            {/* Swipe Button */}
            <SwipeButton
              onSwipeComplete={handleAddToRoute}
              text={isAddingToRoute ? t('addingToRoute') : t('slideToAddToRoute')}
              isLoading={isAddingToRoute}
              iconName="rocket"
              style={styles.swipeButton}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.light.danger,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.light.background,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
    paddingVertical: Spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.textSecondary,
    letterSpacing: 0.5,
  },
  clearButton: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.primary,
  },
  ordersList: {
    flex: 1,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  orderItem: {
    backgroundColor: Colors.light.background,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  orderItemSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '08',
  },
  orderContent: {
    flexDirection: 'row',
    padding: Spacing.lg,
  },
  checkboxContainer: {
    marginRight: Spacing.md,
    paddingTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  orderInfo: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  invoiceNumber: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginRight: Spacing.sm,
  },
  orderAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.primary,
  },
  clientAddress: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.success,
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  priorityIcon: {
    fontSize: 12,
  },
  priorityText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.warning,
    fontWeight: Typography.fontWeight.medium,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  selectionSummary: {
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  summaryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionCount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  selectionTotal: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.primary,
  },
  addButton: {
    marginBottom: 0,
  },
  swipeButton: {
    marginTop: Spacing.sm,
  },
});