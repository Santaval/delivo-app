import {
  PrimaryButton,
  ThemedText,
  ThemedView,
  TopBar
} from '@/components';
import ClientCompactCard from '@/components/clients/ClientCompactCard';
import CurrencyText from '@/components/currency/CurrencyText';
import RecordPaymentModal from '@/components/orders/RecordPaymentModal';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useColorScheme';
import OrdersService from '@/services/orders/Orders.service';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
  index: number;
  total: number;
};

const LineItemRow: React.FC<LineItemRowProps> = ({ item, index, total }) => {
  const colors = useThemeColor();
  
  const itemTotal = item.pricing.totalPrice * item.quantity;

  return (
    <View style={[styles.lineItemRow, { borderBottomColor: colors.border }]}>
      <View style={styles.lineItemContent}>
        <View style={styles.lineItemLeft}>
          <ThemedText style={[styles.productName, { color: colors.text }]}>
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

type StatusBadgeProps = {
  status: Order['status'];
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colors = useThemeColor();
  
  const getStatusConfig = () => {
    switch (status) {
      case 'PAID':
        return {
          backgroundColor: '#10B981',
          color: '#FFFFFF',
          text: 'PAID'
        };
      case 'PENDING':
        return {
          backgroundColor: '#F59E0B',
          color: '#FFFFFF',
          text: 'PENDING'
        };
      case 'CANCELLED':
        return {
          backgroundColor: '#EF4444',
          color: '#FFFFFF',
          text: 'CANCELLED'
        };
      default:
        return {
          backgroundColor: colors.textSecondary,
          color: colors.textInverse,
          text: status
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.backgroundColor }]}>
      <ThemedText style={[styles.statusText, { color: config.color }]}>
        {config.text}
      </ThemedText>
    </View>
  );
};

export default function OrderDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColor();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchOrder = async () => {
    try {
      setError(null);
      const orderData = await OrdersService.getOrderById(id);
      setOrder(orderData);
      
      if (!orderData) {
        setError('Order not found');
      }
    } catch (err) {
      setError('Failed to load order details');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrder();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const generateInvoiceNumber = (orderNumber: number) => {
    return `INV-${orderNumber.toString().padStart(3, '0')}`;
  };



  

  const handlePaymentRecorded = async () => {
    // Refresh order data after payment is recorded
    await fetchOrder();
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <TopBar 
          title="Invoice Details" 
        />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading invoice details...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error || !order) {
    return (
      <ThemedView style={styles.container}>
        <TopBar 
          title="Invoice Details" 
        />
        <View style={styles.centerContent}>
          <MaterialIcons name="error-outline" size={48} color={colors.danger} />
          <ThemedText style={[styles.errorText, { color: colors.danger }]}>
            {error || 'Order not found'}
          </ThemedText>
          <PrimaryButton
            title="Try Again"
            onPress={fetchOrder}
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
        title="Invoice Details" 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
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
                {generateInvoiceNumber(order.number)}
              </ThemedText>
              <ThemedText style={[styles.invoiceDate, { color: colors.textSecondary }]}>
                Issued on {formatDate(order.createdAt || '')}
              </ThemedText>
            </View>
            <StatusBadge status={order.status} />
          </View>
        </ThemedView>

        <ClientCompactCard 
          client={order.client}
        />

        {/* Line Items */}
        <ThemedView style={[styles.lineItemsCard, { backgroundColor: colors.surface }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Line Items
          </ThemedText>
          
          {/* Header */}
          <View style={[styles.lineItemHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <ThemedText style={[styles.headerText, { color: colors.textSecondary }]}>
                Product Name
              </ThemedText>
              <ThemedText style={[styles.headerText, { color: colors.textSecondary }]}>
                Unit Price
              </ThemedText>
            </View>
            <View style={styles.headerRight}>
              <ThemedText style={[styles.headerText, { color: colors.textSecondary }]}>
                Quantity
              </ThemedText>
              <ThemedText style={[styles.headerText, { color: colors.textSecondary }]}>
                Total
              </ThemedText>
            </View>
          </View>

          {/* Items */}
          {order.items.map((item, index) => (
            <LineItemRow
              key={`${item.productId}-${index}`}
              item={item}
              index={index}
              total={item.pricing.totalPrice * item.quantity}
            />
          ))}
        </ThemedView>

        {/* Financial Summary */}
        <ThemedView style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Financial Summary
          </ThemedText>
          
          <View style={styles.summaryRow}>
            <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Subtotal
            </ThemedText>
            <CurrencyText style={[styles.summaryValue, { color: colors.text }]} amount={order.pricing.subtotal} />
          </View>
          
          <View style={styles.summaryRow}>
            <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              IVA Amount ({((order.pricing.ivaTotal / order.pricing.subtotal) * 100).toFixed(0)}%)
            </ThemedText>
            <CurrencyText style={[styles.summaryValue, { color: colors.text }]} amount={order.pricing.ivaTotal} />
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
            <ThemedText style={[styles.totalLabel, { color: colors.text }]}>
              Grand Total
            </ThemedText>
            <CurrencyText style={[styles.totalValue, { color: colors.primary }]} amount={order.pricing.total} />
          </View>
          <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
            <ThemedText style={[styles.totalLabel, { color: colors.text }]}>
              Pending Payment
            </ThemedText>
            <CurrencyText style={[styles.totalValue, { color: colors.danger }]} amount={order.pricing.total - order.paid} />
          </View>
        </ThemedView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>          
          
          {order.status !== 'PAID' && (
            <PrimaryButton
              title="Add Payment"
              onPress={() => setShowPaymentModal(true)}
              style={styles.actionButton}
              variant="primary"
            />
          )}
        </View>
      </ScrollView>

      {/* Payment Modal */}
      {order && (
        <RecordPaymentModal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderId={order.id}
          remainingBalance={order.pricing.total - order.paid}
          onPaymentRecorded={handlePaymentRecorded}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
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