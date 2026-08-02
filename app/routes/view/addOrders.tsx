import { SwipeButton, TopBar } from "@/components";
import {
  BorderRadius,
  RouteAddOrdersParams,
  Routes,
  Spacing,
  Typography,
} from "@/constants";
import { useToast } from "@/context/ToastContext";
import { useThemeColor } from "@/hooks/useColorScheme";
import useOrders from "@/hooks/useOrders";
import RoutesService from "@/services/routes/Routes.service";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddOrders() {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const toast = useToast();
  const { orders, loading, error } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isAddingToRoute, setIsAddingToRoute] = useState(false);

  const { routeId } = useLocalSearchParams<RouteAddOrdersParams>();

  // Filter and search orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => !order.route) // Only show orders not already assigned to routes
      .filter(
        (order) =>
          searchQuery === "" ||
          order.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `INV-${order.number.toString().padStart(3, "0")}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
  }, [orders, searchQuery]);

  // Get pending orders (not assigned to routes)
  const pendingOrders = filteredOrders.filter(
    (order) => order.deliveryStatus === "PENDING",
  );

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
      const order = filteredOrders.find((o) => o.id === orderId);
      return total + (order?.pricing.total || 0);
    }, 0);
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const generateInvoiceNumber = (orderNumber: number) => {
    return `INV-${orderNumber.toString().padStart(3, "0")}`;
  };

  const handleAddToRoute = async () => {
    if (selectedOrders.size === 0) {
      toast.show({ message: t("selectAtLeastOneOrder"), type: "info" });
      return;
    }

    setIsAddingToRoute(true);
    try {
      const promises = Array.from(selectedOrders).map((orderId) =>
        RoutesService.addPoint(routeId, orderId),
      );
      await Promise.all(promises);
      router.replace(Routes.routeView(routeId));
    } catch (err) {
      toast.show({ message: t("failedToAddOrdersToRoute"), type: "error" });
    } finally {
      setIsAddingToRoute(false);
    }
  };

  const clearSelection = () => {
    setSelectedOrders(new Set());
  };

  const getOrderPriorityIcon = (order: Order) => {
    // Mock priority logic - you can customize this based on your business rules
    if (order.pricing.total > 500) return "⚠️"; // High value
    if (
      order.status === "PENDING" &&
      new Date(order.createdAt) < new Date(Date.now() - 24 * 60 * 60 * 1000)
    ) {
      return "🔺"; // Old pending order
    }
    return null;
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const isSelected = selectedOrders.has(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.orderItem,
          { backgroundColor: colors.background, borderColor: colors.border },
          isSelected && {
            borderColor: colors.primary,
            backgroundColor: colors.primary + "08",
          },
        ]}
        onPress={() => toggleOrderSelection(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.orderContent}>
          <View style={styles.checkboxContainer}>
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
                isSelected && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
            >
              {isSelected && (
                <Ionicons
                  name="checkmark"
                  size={16}
                  color={colors.textInverse}
                />
              )}
            </View>
          </View>

          <View style={styles.orderInfo}>
            <View style={styles.orderHeader}>
              <Text style={[styles.invoiceNumber, { color: colors.text }]}>
                {generateInvoiceNumber(item.number)} | {item.client.name}
              </Text>
              <Text style={[styles.orderAmount, { color: colors.primary }]}>
                {formatPrice(item.pricing.total)}
              </Text>
            </View>

            <View style={styles.orderFooter}>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: colors.success },
                  ]}
                />
                <Text
                  style={[styles.statusText, { color: colors.textSecondary }]}
                >
                  {item.status === "PENDING"
                    ? t("readyForPickup")
                    : item.status}
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
      <Ionicons
        name="document-text-outline"
        size={64}
        color={colors.textTertiary}
      />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {t("noOrdersAvailable")}
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        {searchQuery ? t("noOrdersMatchSearch") : t("allOrdersAssigned")}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <TopBar
          title={t("addOrdersToRoute")}
          showBack
          backTo={Routes.tabRoutes}
        />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {t("loadingOrders")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <TopBar
          title={t("addOrdersToRoute")}
          showBack
          backTo={Routes.tabRoutes}
        />
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: colors.danger }]}>
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TopBar
        title={t("addOrdersToRoute")}
        showBack
        backTo={Routes.tabRoutes}
      />

      <View style={styles.content}>
        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View
            style={[
              styles.searchInputContainer,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t("searchByNameOrNumber")}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textSecondary}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Section Header */}
        <View
          style={[styles.sectionHeader, { borderBottomColor: colors.border }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t("pendingOrders")} ({pendingOrders.length})
          </Text>
          {selectedOrders.size > 0 && (
            <TouchableOpacity onPress={clearSelection}>
              <Text style={[styles.clearButton, { color: colors.primary }]}>
                {t("clearSelection")}
              </Text>
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
          contentContainerStyle={
            pendingOrders.length === 0 ? styles.emptyListContent : undefined
          }
          ListEmptyComponent={renderEmptyState}
        />

        {/* Selection Summary & Add Button */}
        {selectedOrders.size > 0 && (
          <View
            style={[
              styles.selectionSummary,
              {
                backgroundColor: colors.background,
                borderTopColor: colors.border,
              },
            ]}
          >
            <View style={styles.summaryInfo}>
              <Text style={[styles.selectionCount, { color: colors.text }]}>
                {selectedOrders.size}{" "}
                {selectedOrders.size !== 1 ? t("orders") : t("order")}{" "}
                {t("ordersSelected")}
              </Text>
              <Text style={[styles.selectionTotal, { color: colors.primary }]}>
                {t("totalValue")}: {formatPrice(calculateTotalValue())}
              </Text>
            </View>

            {/* Swipe Button */}
            <SwipeButton
              onSwipeComplete={handleAddToRoute}
              text={
                isAddingToRoute ? t("addingToRoute") : t("slideToAddToRoute")
              }
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
  },
  content: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    textAlign: "center",
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    textAlign: "center",
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    paddingVertical: Spacing.xs,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: 0.5,
  },
  clearButton: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  ordersList: {
    flex: 1,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  orderItem: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  orderContent: {
    flexDirection: "row",
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
    justifyContent: "center",
    alignItems: "center",
  },
  orderInfo: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
  },
  invoiceNumber: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginRight: Spacing.sm,
  },
  orderAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  clientAddress: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.sm,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
  },
  priorityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  priorityIcon: {
    fontSize: 12,
  },
  priorityText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    fontSize: Typography.fontSize.base,
    textAlign: "center",
    lineHeight: 22,
  },
  selectionSummary: {
    borderTopWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  summaryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectionCount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  selectionTotal: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  addButton: {
    marginBottom: 0,
  },
  swipeButton: {
    marginTop: Spacing.sm,
  },
});
