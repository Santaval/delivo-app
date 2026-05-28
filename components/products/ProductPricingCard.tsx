import { BorderRadius, Colors, Shadows, Spacing, Typography } from "@/constants";
import { useThemeColor } from "@/hooks/useColorScheme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import CurrencyText from "../currency/CurrencyText";

type Props = {
  netPrice: number;
  ivaRate: number;
  ivaAmount: number;
  totalPrice: number;
};

export default function ProductPricingCard({
  netPrice,
  ivaRate,
  ivaAmount,
  totalPrice,
}: Props) {
  const colors = useThemeColor();

  return (
    <ThemedView style={[styles.card, { backgroundColor: colors.surface }]}>
      <ThemedText style={styles.sectionTitle}>Precios</ThemedText>

      <View style={styles.row}>
        <ThemedText variant="caption" style={styles.label}>
          NETO
        </ThemedText>
        <CurrencyText style={styles.value} amount={netPrice} />
      </View>

      <View style={styles.row}>
        <ThemedText variant="caption" style={styles.label}>
          IVA ({ivaRate}%)
        </ThemedText>
        <CurrencyText style={styles.value} amount={ivaAmount} />
      </View>

      <View style={[styles.row, styles.divider]}>
        <ThemedText style={styles.totalLabel}>TOTAL</ThemedText>
        <CurrencyText style={styles.totalValue} amount={totalPrice} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    ...Shadows.small,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  divider: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  value: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  totalLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  totalValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.primary,
  },
});
