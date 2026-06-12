import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import CurrencyText from './currency/CurrencyText';
import OrderStatusBadge from './orders/OrderStatusBadge';


export type OrderCardProps = {
  order: Order;
  onPress?: (orderId: string) => void;
};

export function OrderCard({
  order,
  onPress,
}: OrderCardProps) {
  const colors = useThemeColor();


  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress && onPress(order.id)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`INV-${order.number}, ${order.client.name ?? ''}`}
    >
      <ThemedView style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.content}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            {/* Status Badge */}
            <OrderStatusBadge status={order.deliveryStatus} />



            {/* Order Info */}
            <View style={styles.orderInfo}>
              <ThemedText style={styles.invoiceNumber}>
                INV-{order.number}
              </ThemedText>
              {order.client.name && (
                <ThemedText style={styles.clientName}>
                  {order.client.name}
                </ThemedText>
              )}
              <ThemedText style={styles.date}>
                {moment(order.createdAt).format('MMMM D, YYYY')}
              </ThemedText>
            </View>
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            <CurrencyText style={styles.amount} amount={order.pricing.total} />
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={colors.textTertiary || Colors.light.textTertiary}
              style={styles.chevron}
            />
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  card: {
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  leftSection: {
    flex: 1,
  },

  orderInfo: {
    gap: 2,
  },
  invoiceNumber: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: 2,
  },
  clientName: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  date: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  amount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    textAlign: 'right',
  },
  chevron: {
    marginLeft: Spacing.xs,
  },
});
