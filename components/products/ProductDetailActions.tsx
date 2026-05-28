import { BorderRadius, Spacing, Typography } from "@/constants";
import { useThemeColor } from "@/hooks/useColorScheme";
import React from "react";
import { Alert, StyleSheet, View } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { PrimaryButton } from "../PrimaryButton";

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

  const handleDelete = () => {
    Alert.alert(
      "Eliminar producto",
      "¿Estás seguro de que deseas eliminar este producto?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: onDelete },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.sectionTitle}>Acciones</ThemedText>

      <View style={styles.buttonsRow}>
        <View style={styles.buttonFlex}>
          <PrimaryButton
            title="Editar"
            onPress={onEdit}
            style={styles.editButton}
          />
        </View>
        <View style={styles.buttonFlex}>
          <PrimaryButton
            title="Eliminar"
            variant="outline"
            onPress={handleDelete}
            style={styles.deleteButton}
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
    borderColor: Colors.light.danger,
  },
});
