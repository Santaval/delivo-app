import { BorderRadius, Shadows, Spacing, Typography } from "@/constants";
import { useThemeColor } from "@/hooks/useColorScheme";
import moment from "@/moment/moment";
import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

type Props = {
  createdAt: string;
  updatedAt: string;
};

export default function ProductMetaCard({ createdAt, updatedAt }: Props) {
  const colors = useThemeColor();

  const formatDate = (date: string) => moment(date).format("DD MMM YYYY, HH:mm");

  return (
    <ThemedView style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.row}>
        <MaterialIcons
          name="event"
          size={18}
          color={Colors.light.textSecondary}
        />
        <View style={styles.metaContent}>
          <ThemedText variant="caption" style={styles.label}>
            Creado
          </ThemedText>
          <ThemedText style={styles.value}>{formatDate(createdAt)}</ThemedText>
        </View>
      </View>

      <View style={[styles.row, styles.rowLast]}>
        <MaterialIcons
          name="update"
          size={18}
          color={Colors.light.textSecondary}
        />
        <View style={styles.metaContent}>
          <ThemedText variant="caption" style={styles.label}>
            Actualizado
          </ThemedText>
          <ThemedText style={styles.value}>{formatDate(updatedAt)}</ThemedText>
        </View>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  rowLast: {
    paddingBottom: 0,
  },
  metaContent: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs / 2,
  },
  value: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
});
