import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Routes, Spacing, Typography } from '@/constants';
import { useCredits } from '@/context/CreditsContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity } from 'react-native';

/** Compact "available bills" pill (receipt icon + count) for the home header,
 *  next to the avatar; opens the purchase screen or the credit history. */
export function CreditsBalanceLine() {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const { balance, isBlocked, isInOverdraft, isLow, canPurchase } = useCredits();

  if (balance === null) return null;

  const isAlert = isBlocked || isInOverdraft;
  const color = isAlert ? colors.danger : isLow ? colors.warning : colors.text;
  const label = t('creditsAvailable', { count: balance });

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderColor: isAlert || isLow ? color : colors.border, backgroundColor: colors.surface },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
      onPress={() => router.push(canPurchase ? Routes.creditsBuy : Routes.creditsHistory)}
    >
      <MaterialIcons name="receipt-long" size={16} color={color} />
      <ThemedText style={[styles.count, { color }]} numberOfLines={1}>
        {balance}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: 32,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  count: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
});
