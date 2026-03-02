import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import CurrencyText from './currency/CurrencyText';


export type OrderCardProps = {
  order: Order;
  onPress?: (orderId: string) => void;
};

export function OrderCard({
  order,
  onPress,
}: OrderCardProps) {
  const colors = useThemeColor();
  const { t } = useTranslation();


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'PAID':
        return {
          label: t('paid'),
          backgroundColor: Colors.light.success + '20',
          textColor: Colors.light.success,
        };
      case 'PENDING':
        return {
          label: t('pending'),
          backgroundColor: Colors.light.warning + '20',
          textColor: Colors.light.warning,
        };
      case 'CANCELLED':
        return {
          label: t('cancelled'),
          backgroundColor: Colors.light.textTertiary + '20',
          textColor: Colors.light.textTertiary,
        };
      default:
        return {
          label: t('unknown'),
          backgroundColor: Colors.light.textTertiary + '20',
          textColor: Colors.light.textTertiary,
        };
    }
  };

  const statusConfig = getStatusConfig(order.status);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress && onPress(order.id)}
      activeOpacity={0.8}
    >
      <ThemedView style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.content}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            {/* Status Badge */}
            <View style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.backgroundColor }
            ]}>
              <ThemedText style={[
                styles.statusText,
                { color: statusConfig.textColor }
              ]}>
                {statusConfig.label}
              </ThemedText>
            </View>

            

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
                {formatDate(order.createdAt)}
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
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
