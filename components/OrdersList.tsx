import { BorderRadius, Colors, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import React, { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { OrderCard } from './OrderCard';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type TabType = 'all' | 'paid' | 'pending';

export type OrdersListProps = {
  orders: Order[];
  onOrderPress?: (orderId: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
};

export function OrdersList({ orders, onOrderPress, onRefresh, isRefreshing }: OrdersListProps) {
  const colors = useThemeColor();
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'paid', label: 'Paid' },
    { key: 'pending', label: 'Pending' },
  ];

  // Filter orders based on active tab
  const filteredOrders = useMemo(() => {
    switch (activeTab) {
      case 'paid':
        return orders.filter(order => order.status === 'PAID');
      case 'pending':
        return orders.filter(order => 
          order.status === 'PENDING'
        );
      case 'all':
      default:
        return orders;
    }
  }, [orders, activeTab]);

  const getTabCount = (tab: TabType) => {
    switch (tab) {
      case 'paid':
        return orders.filter(order => order.status === 'PAID').length;
      case 'pending':
        return orders.filter(order => 
          order.status === 'PENDING'
        ).length;
      case 'all':
      default:
        return orders.length;
    }
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

  const renderEmptyState = () => {
    const getEmptyMessage = () => {
      switch (activeTab) {
        case 'paid':
          return 'No paid orders yet';
        case 'pending':
          return 'No pending orders';
        case 'all':
        default:
          return 'No orders yet';
      }
    };

    const getEmptySubtitle = () => {
      switch (activeTab) {
        case 'paid':
          return 'Completed orders will appear here';
        case 'pending':
          return 'Pending and overdue orders will appear here';
        case 'all':
        default:
          return 'Create your first order to get started';
      }
    };

    return (
      <View style={styles.emptyState}>
        <ThemedText style={styles.emptyTitle}>
          {getEmptyMessage()}
        </ThemedText>
        <ThemedText style={styles.emptySubtitle}>
          {getEmptySubtitle()}
        </ThemedText>
      </View>
    );
  };

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
        {filteredOrders.length > 0 ? (
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
