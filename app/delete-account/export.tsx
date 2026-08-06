import { PrimaryButton, ThemedText } from "@/components";
import { TopBar } from "@/components/TopBar";
import config from "@/config/env";
import { Routes, Spacing, Typography } from "@/constants";
import { toast } from "@/context/ToastContext";
import { useThemeColor } from "@/hooks/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DeleteAccountExportScreen() {
  const { t } = useTranslation();
  const colors = useThemeColor();

  // Same split-around-marker trick as index.tsx: the support email is a link
  // embedded mid-sentence.
  const [emailBefore, emailAfter] = t("deleteAccountExportEmail").split(
    "@@EMAIL@@",
  );

  const handleEmailPress = () => {
    const subject = encodeURIComponent(t("deleteAccountExportEmailSubject"));
    Linking.openURL(`mailto:${config.supportEmail}?subject=${subject}`).catch(
      () => toast.error(t("couldNotOpenEmailApplication")),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title={t("deleteAccountExportTitle")} showBack backTo={Routes.deleteAccount} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.bulletList}>
          <View style={styles.bulletRow}>
            <MaterialIcons name="mail-outline" size={22} color={colors.primary} />
            <ThemedText style={styles.bulletText}>
              {emailBefore}
              <ThemedText
                variant="link"
                onPress={handleEmailPress}
                accessibilityRole="link"
              >
                {config.supportEmail}
              </ThemedText>
              {emailAfter}
            </ThemedText>
          </View>

          <View style={styles.bulletRow}>
            <MaterialIcons name="warning" size={22} color={colors.warning} />
            <ThemedText style={styles.bulletText}>
              {t("deleteAccountExportNoRecovery")}
            </ThemedText>
          </View>

          <View style={styles.bulletRow}>
            <MaterialIcons name="schedule" size={22} color={colors.textSecondary} />
            <ThemedText style={styles.bulletText}>
              {t("deleteAccountExport30Days")}
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <PrimaryButton
          title={t("continue")}
          onPress={() => router.push(Routes.deleteAccountConfirm)}
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
    gap: Spacing.lg,
  },
  bulletList: {
    gap: Spacing.lg,
  },
  bulletRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  bulletText: {
    flex: 1,
    lineHeight: 22,
    fontSize: Typography.fontSize.base,
  },
  actions: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
});
