import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "@/constants";
import { useThemeColor } from "@/hooks/useColorScheme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import CurrencyText from "./currency/CurrencyText";

type Props = {
  item: Product;
  onEdit?: (id: string) => void;
};

export default function ProductCard({ item, onEdit }: Props) {
  const colors = useThemeColor();

  return (
    <ThemedView style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.row}>
        <View style={styles.info}>
          <ThemedText style={styles.title}>{item.name}</ThemedText>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <ThemedText variant="caption" style={styles.metaLabel}>
                NET
              </ThemedText>
              <CurrencyText
                style={styles.metaValue}
                amount={item.pricing.netPrice}
              />
            </View>

            <View style={styles.metaItem}>
              <ThemedText variant="caption" style={styles.metaLabel}>
                IVA
              </ThemedText>
              <ThemedText style={styles.metaValue}>
                {item.pricing.ivaRate}%
              </ThemedText>
            </View>

            <View style={styles.metaItemRight}>
              <ThemedText
                variant="caption"
                style={[styles.metaLabel, { textAlign: "right" }]}
              >
                TOTAL
              </ThemedText>
              <CurrencyText
                style={styles.totalValue}
                amount={item.pricing.totalPrice}
              />
            </View>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    ...Shadows.small,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaItem: {
    flexDirection: "column",
    minWidth: 80,
  },
  metaItemRight: {
    flexDirection: "column",
    alignItems: "flex-end",
    minWidth: 100,
  },
  metaLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },
  metaValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  totalValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.primary,
  },
  editButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.md,
    borderRadius: 8,
  },
});
