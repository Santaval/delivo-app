import { BorderRadius, Shadows, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import CurrencyText from '../currency/CurrencyText';


export type BillCardProps = {
  order: Order;
  onPress?: (orderId: string) => void;
};

export function BillCard({
  order,
  onPress,
}: BillCardProps) {
  const colors = useThemeColor();
  const { t } = useTranslation();

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {

      case 'PENDING':
        return {
          label: t('pending'),
          backgroundColor: colors.danger + '20',
          textColor: colors.danger,
        };


      case "PAID":
        return {
          label: t('paid'),
          backgroundColor: colors.success + '20',
          textColor: colors.success,
        };
      default:
        return {
          label: t('unknown'),
          backgroundColor: colors.textTertiary + '20',
          textColor: colors.textTertiary,
        };
    }
  };

  const statusConfig = getStatusConfig(order.status);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress && onPress(order.id)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${order.client?.name ?? ''}, ${statusConfig.label}`}
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
              <ThemedText style={[styles.invoiceNumber, { color: colors.text }]}>
                INV-{order.number}
              </ThemedText>
              {order.client.name && (
                <ThemedText style={[styles.clientName, { color: colors.textSecondary }]}>
                  {order.client.name}
                </ThemedText>
              )}
              <ThemedText style={[styles.date, { color: colors.textSecondary }]}>
                {moment(order.createdAt).format('MMMM D, YYYY')}
              </ThemedText>
            </View>
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            <CurrencyText style={[styles.amount, { color: colors.text }]} amount={order.pricing.total} />
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={colors.textTertiary}
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
    marginBottom: 2,
  },
  clientName: {
    fontSize: Typography.fontSize.sm,
    marginBottom: 2,
  },
  date: {
    fontSize: Typography.fontSize.sm,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  amount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'right',
  },
  chevron: {
    marginLeft: Spacing.xs,
  },
});
