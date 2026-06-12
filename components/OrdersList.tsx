import { BorderRadius, Colors, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { EmptyState } from './feedback/EmptyState';
import { ErrorState } from './feedback/ErrorState';
import { OrderCard } from './OrderCard';
import { OrderCardSkeleton } from './OrderCardSkeleton';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type TabType = OrderDeliveryStatus | 'ALL';

export type OrdersListProps = {
  orders: Order[];
  onOrderPress?: (orderId: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  loading?: boolean;
  error?: string | null;
  onCreateFirst?: () => void;
};

export function OrdersList({ orders, onOrderPress, onRefresh, isRefreshing, loading, error, onCreateFirst }: OrdersListProps) {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('ALL');

  const tabs: { key: TabType; label: string }[] = [
    { key: 'ALL', label: t('all') },
    // { key: 'DELIVERED', label: t('delivered') },
    { key: 'PENDING', label: t('pending') },
    { key: 'ON_ROUTE', label: t('onRoute') },
    { key: 'IN_TRANSIT', label: t('inTransit') },
    { key: 'RETURNED', label: t('returned') },
  ];

  // Filter orders based on active tab
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (activeTab === 'ALL') return true;
      return order.deliveryStatus === activeTab;
    });
  }, [orders, activeTab]);

  const getTabCount = (tab: TabType) => {
    return orders.filter(order => {
      if (tab === 'ALL') return true;
      return order.deliveryStatus === tab;
    }).length;
  };


  const renderTabButton = (tab: { key: TabType; label: string }) => {
    const isActive = activeTab === tab.key;
    const count = getTabCount(tab.key);

    return (
      <TouchableOpacity
        key={tab.key}
        style={[
          styles.tabButton,
          isActive && styles.tabButtonActive,
          { 
            backgroundColor: isActive ? colors.primary : colors.backgroundSecondary,
            borderColor: isActive ? colors.primary : colors.border 
          }
        ]}
        onPress={() => setActiveTab(tab.key)}
        activeOpacity={0.8}
      >
        <ThemedText style={[
          styles.tabText,
          isActive && styles.tabTextActive,
          { color: isActive ? Colors.light.textInverse : colors.text }
        ]}>
          {tab.label}
        </ThemedText>
        {count > 0 && (
          <View style={[
            styles.tabBadge,
            { backgroundColor: isActive ? Colors.light.textInverse : colors.textTertiary }
          ]}>
            <ThemedText style={[
              styles.tabBadgeText,
              { color: isActive ? colors.primary : Colors.light.textInverse }
            ]}>
              {count}
            </ThemedText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const emptyTitleByTab: Record<string, string> = {
    ALL: t('noOrdersYet'),
    DELIVERED: t('noDeliveredOrdersYet'),
    PENDING: t('noPendingOrdersYet'),
    ON_ROUTE: t('noOnRouteOrdersYet'),
    IN_TRANSIT: t('noInTransitOrdersYet'),
    RETURNED: t('noReturnedOrdersYet'),
  };

  const renderEmptyState = () => (
    <EmptyState
      icon="shopping-cart"
      title={emptyTitleByTab[activeTab] ?? t('noOrdersYet')}
      actionLabel={activeTab === 'ALL' && onCreateFirst ? t('createOrder') : undefined}
      onAction={activeTab === 'ALL' ? onCreateFirst : undefined}
    />
  );

  return (
    <ThemedView style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map(renderTabButton)}
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.ordersContainer}
        contentContainerStyle={styles.ordersContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <OrderCardSkeleton key={i} />)
        ) : error && orders.length === 0 ? (
          <ErrorState message={error} onRetry={onRefresh} />
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={onOrderPress}
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
  },
  tabsContainer: {
    backgroundColor: Colors.light.background,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tabsContent: {
    gap: Spacing.sm,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    color: Colors.light.text,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
