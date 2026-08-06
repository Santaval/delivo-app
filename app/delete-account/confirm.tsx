import { FormField, PrimaryButton, ThemedText } from "@/components";
import { TopBar } from "@/components/TopBar";
import { Routes, Spacing } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useThemeColor } from "@/hooks/useColorScheme";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DeleteAccountConfirmScreen() {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const { deleteAccount } = useAuth();
  const toast = useToast();
  const [value, setValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const word = t("deleteAccountConfirmWord");
  const matches = value.trim().toUpperCase() === word;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      // replace: el flujo no debe quedar en el stack
      router.replace(Routes.deleteAccountDone);
    } catch (e) {
      toast.show({
        message: e instanceof Error ? e.message : t("genericError"),
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title={t("deleteAccountConfirmTitle")} showBack backTo={Routes.deleteAccountExport} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.summary, { color: colors.textSecondary }]}>
          {t("deleteAccountConfirmSummary")}
        </ThemedText>

        <FormField
          label={t("deleteAccountConfirmTypeLabel", { word })}
          value={value}
          onChangeText={setValue}
          autoCapitalize="characters"
          autoCorrect={false}
        />
      </ScrollView>

      <View style={styles.actions}>
        <PrimaryButton
          title={isDeleting ? t("deleting") : t("deleteAccountConfirmCta")}
          variant="danger"
          disabled={!matches || isDeleting}
          onPress={handleDelete}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    gap: Spacing.xl,
  },
  summary: {
    lineHeight: 22,
  },
  actions: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
});
