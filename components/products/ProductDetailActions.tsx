import { BorderRadius, Spacing, Typography } from "@/constants";
import { useThemeColor } from "@/hooks/useColorScheme";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, View } from "react-native";
import { PrimaryButton } from "../PrimaryButton";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

type Props = {
  onEdit: () => void;
  onDelete: () => Promise<void>;
  loading?: boolean;
};

export default function ProductDetailActions({
  onEdit,
  onDelete,
  loading,
}: Props) {
  const colors = useThemeColor();
  const { t } = useTranslation();

  const handleDelete = () => {
    Alert.alert(
      t("deleteProduct"),
      t("deleteProductConfirmation"),
      [
        { text: t("cancel"), style: "cancel" },
        { text: t("delete"), style: "destructive", onPress: onDelete },
      ],
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.sectionTitle}>{t("actions")}</ThemedText>

      <View style={styles.buttonsRow}>
        <View style={styles.buttonFlex}>
          <PrimaryButton
            title={t("edit")}
            onPress={onEdit}
            style={styles.editButton}
          />
        </View>
        <View style={styles.buttonFlex}>
          <PrimaryButton
            title={t("delete")}
            variant="outline"
            onPress={handleDelete}
            style={{ ...styles.deleteButton, borderColor: colors.danger }}
            disabled={loading}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl * 2,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  buttonFlex: {
    flex: 1,
  },
  editButton: {
    borderRadius: BorderRadius.lg,
  },
  deleteButton: {
    borderRadius: BorderRadius.lg,
  },
});
