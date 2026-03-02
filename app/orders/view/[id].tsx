import {
  PrimaryButton,
  ThemedText,
  ThemedView,
  TopBar
} from '@/components';
import ClientCompactCard from '@/components/clients/ClientCompactCard';
import CurrencyText from '@/components/currency/CurrencyText';
import AddProductsModal from '@/components/orders/AddProductsModal';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useColorScheme';
import useOrder from '@/hooks/useOrder';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import moment from 'moment';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


type LineItemRowProps = {
  item: OrderItem;
  onRemove: (itemId: string) => void;
  index: number;
  total: number;
};

const LineItemRow: React.FC<LineItemRowProps> = ({ item, onRemove }) => {
  const colors = useThemeColor();

  const itemTotal = item.pricing.totalPrice * item.quantity;

  return (
    <View style={[styles.lineItemRow, { borderBottomColor: colors.border }]}>
      <View style={styles.lineItemContent}>
        <View style={styles.lineItemLeft}>
          <ThemedText style={[styles.productName, { color: colors.text }]}>
            <MaterialIcons name="delete" size={24} color={colors.danger} onPress={() => onRemove(item.id)} />

            {item.name}
          </ThemedText>
          <CurrencyText style={[styles.unitPrice, { color: colors.textSecondary }]} amount={item.pricing.totalPrice} />
        </View>

        <View style={styles.lineItemRight}>
          <ThemedText style={[styles.quantity, { color: colors.text }]}>
            {item.quantity}
          </ThemedText>
          <CurrencyText style={[styles.total, { color: colors.text }]} amount={itemTotal} />
        </View>
      </View>
    </View>
  );
};



export default function OrderDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColor();
  const { t } = useTranslation();
  const { order, loading, error, refresh, addItems, removeItem, markAsDelivered } = useOrder(id);
  const [showAddProductsModal, setShowAddProductsModal] = useState(false);

  const onMarkAsDelivered = async () => {
    try {
      await markAsDelivered();
      router.replace(`/bills/view/${id}`);
    } catch (error) {
      console.error('Failed to mark as delivered', error);
    }
  };

  const generateOrderNumber = (orderNumber: number) => {
    return `ORD-${orderNumber.toString().padStart(3, '0')}`;
  };


  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <TopBar
          title={t('invoiceDetails')}
        />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
            {t('loadingInvoiceDetails')}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error || !order) {
    return (
      <ThemedView style={styles.container}>
        <TopBar
          title={t('invoiceDetails')}
        />
        <View style={styles.centerContent}>
          <MaterialIcons name="error-outline" size={48} color={colors.danger} />
          <ThemedText style={[styles.errorText, { color: colors.danger }]}>
            {error || 'Order not found'}
          </ThemedText>
          <PrimaryButton
            title="Try Again"
            onPress={refresh}
            style={styles.retryButton}
          />
        </View>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}>
      <TopBar
        title={t('invoiceDetails')}
      />

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
        {/* Invoice Header */}
        <ThemedView style={[styles.headerCard, { backgroundColor: colors.surface }]}>
          <View style={styles.headerContent}>
            <View>
              <ThemedText style={[styles.invoiceNumber, { color: colors.text }]}>
                {generateOrderNumber(order.number)}
              </ThemedText>
              <ThemedText style={[styles.invoiceDate, { color: colors.textSecondary }]}>
                {t('issuedOn')} {moment(order.createdAt).format('MMMM D, YYYY')}
              </ThemedText>
            </View>
            <OrderStatusBadge status={order.deliveryStatus} />
          </View>
        </ThemedView>

        <ClientCompactCard
          client={order.client}
        />

        {/* Line Items */}
        <ThemedView style={[styles.lineItemsCard, { backgroundColor: colors.surface }]}>
          <View style={styles.lineItemContent}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              {t("products")}
            </ThemedText>

          </View>

          {/* Header */}
          <View style={[styles.lineItemHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <ThemedText style={[styles.headerText, { color: colors.textSecondary }]}>
                {t("productName")}
              </ThemedText>
              <ThemedText style={[styles.headerText, { color: colors.textSecondary }]}>
                {t("unitPrice")}
              </ThemedText>
            </View>
            <View style={styles.headerRight}>
              <ThemedText style={[styles.headerText, { color: colors.textSecondary }]}>
                {t("quantity")}
              </ThemedText>
              <ThemedText style={[styles.headerText, { color: colors.textSecondary }]}>
                {t("total")}
              </ThemedText>
            </View>
          </View>

          {/* Items */}
          {order.items.map((item, index) => (
            <LineItemRow
              onRemove={removeItem}
              key={`${item.productId}-${index}`}
              item={item}
              index={index}
              total={item.pricing.totalPrice * item.quantity}
            />
          ))}

          {order.deliveryStatus !== "DELIVERED" && (
            <PrimaryButton
              onPress={() => setShowAddProductsModal(true)}
              title={'+ ' + t("addProducts")}
              variant='outline'
              style={{ marginTop: Spacing.md }}
            />
          )}

        </ThemedView>

        {/* Financial Summary */}
        <ThemedView style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            {t("financialSummary")}
          </ThemedText>

          <View style={styles.summaryRow}>
            <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              {t("subtotal")}
            </ThemedText>
            <CurrencyText style={[styles.summaryValue, { color: colors.text }]} amount={order.pricing.subtotal} />
          </View>

          <View style={styles.summaryRow}>
            <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              {t("ivaAmount")} ({((order.pricing.ivaTotal / order.pricing.subtotal) * 100).toFixed(0)}%)
            </ThemedText>
            <CurrencyText style={[styles.summaryValue, { color: colors.text }]} amount={order.pricing.ivaTotal} />
          </View>

          <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
            <ThemedText style={[styles.totalLabel, { color: colors.text }]}>
              {t("grandTotal")}
            </ThemedText>
            <CurrencyText style={[styles.totalValue, { color: colors.primary }]} amount={order.pricing.total} />
          </View>
        </ThemedView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>

          <PrimaryButton
            title={t("generateBill")}
            onPress={onMarkAsDelivered}
            style={{ marginTop: Spacing.md }}
          />
        </View>

        <AddProductsModal 
          onAdd={addItems}
          onClose={() => setShowAddProductsModal(false)}
          visible={showAddProductsModal}
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
    paddingBottom: Spacing.xl * 2,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
  },
  headerCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceNumber: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  invoiceDate: {
    fontSize: Typography.fontSize.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  lineItemsCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  lineItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    marginBottom: Spacing.sm,
  },
  addButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.primary,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    width: 140,
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lineItemRow: {
    borderBottomWidth: 1,
    paddingVertical: Spacing.sm,
  },
  lineItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lineItemLeft: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  lineItemRight: {
    flexDirection: 'row',
    width: 140,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 2,
  },
  unitPrice: {
    fontSize: Typography.fontSize.xs,
  },
  quantity: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    minWidth: 30,
  },
  total: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'right',
    minWidth: 60,
  },
  summaryCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
  },
  summaryValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  totalRow: {
    borderTopWidth: 1,
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
  },
  totalLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  totalValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  actionButtons: {
    gap: Spacing.md,
  },
  actionButton: {
    marginBottom: Spacing.sm,
  },
});