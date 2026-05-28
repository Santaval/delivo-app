import { BorderRadius, Shadows, Spacing, Typography } from "@/constants";
import { useThemeColor } from "@/hooks/useColorScheme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import CurrencyText from "../currency/CurrencyText";

type Props = {
  name: string;
  totalPrice: number;
};

export default function ProductDetailHeader({ name, totalPrice }: Props) {
  const colors = useThemeColor();

  return (
    <ThemedView style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.content}>
        <ThemedText style={styles.name}>{name}</ThemedText>
        <View style={styles.priceRow}>
          <ThemedText variant="caption" style={styles.priceLabel}>
            TOTAL
          </ThemedText>
          <CurrencyText style={styles.priceValue} amount={totalPrice} />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  content: {
    alignItems: "center",
  },
  name: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  priceRow: {
    alignItems: "center",
  },
  priceLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  priceValue: {
    fontSize: Typography.fontSize["3xl"],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.primary,
  },
});
