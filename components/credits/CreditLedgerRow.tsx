import { BorderRadius, Shadows, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';

export type CreditLedgerRowProps = {
  entry: CreditLedgerEntry;
};

function CreditLedgerRowComponent({ entry }: CreditLedgerRowProps) {
  const colors = useThemeColor();
  const { t } = useTranslation();

  // Not tappable on purpose: billId is a ClientBill id, while the bill screen
  // expects an order id, so linking would open the wrong record.
  let label: string;
  if (entry.reason === 'BILL_ISSUED') {
    label =
      entry.billNumber != null
        ? t('creditReason_BILL_ISSUED', { number: entry.billNumber })
        : t('creditReason_BILL_ISSUED_noNumber');
  } else {
    label = t(`creditReason_${entry.reason}`, { defaultValue: t('creditReason_UNKNOWN') });
  }

  const positive = entry.delta >= 0;
  const deltaColor = positive ? colors.success : colors.danger;
  const deltaText = `${positive ? '+' : '−'}${Math.abs(entry.delta)}`;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.left}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        {entry.reason === 'ADMIN_ADJUSTMENT' && entry.note ? (
          <ThemedText variant="caption">{entry.note}</ThemedText>
        ) : null}
        <ThemedText variant="caption">{moment(entry.createdAt).format('LLL')}</ThemedText>
      </View>
      <View style={styles.right}>
        <ThemedText style={[styles.delta, { color: deltaColor }]}>{deltaText}</ThemedText>
        <ThemedText variant="caption">
          {t('creditsBalanceAfter', { balance: entry.balanceAfter })}
        </ThemedText>
      </View>
    </View>
  );
}

/** Memoized: rendered inside FlashList, where cells are recycled while scrolling. */
export const CreditLedgerRow = React.memo(CreditLedgerRowComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  left: {
    flex: 1,
    gap: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  delta: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
});
