import { PrimaryButton, ThemedText } from "@/components";
import { TopBar } from "@/components/TopBar";
import { Routes, Spacing, Typography } from "@/constants";
import config from "@/config/env";
import { useThemeColor } from "@/hooks/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DeleteAccountScreen() {
  const { t } = useTranslation();
  const colors = useThemeColor();

  // The terms link is embedded mid-sentence, so the string is split around a
  // marker instead of nesting a second i18n key inside the first.
  const [termsBefore, termsAfter] = t("deleteAccountBulletTerms").split(
    "@@TERMS@@",
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title={t("deleteAccount")} showBack backTo={Routes.account} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedText variant="title" style={styles.title}>
          {t("deleteAccountWhatHappensTitle")}
        </ThemedText>

        <View style={styles.bulletList}>
          <View style={styles.bulletRow}>
            <MaterialIcons name="warning" size={22} color={colors.warning} />
            <ThemedText style={styles.bulletText}>
              {t("deleteAccountBulletData")}
            </ThemedText>
          </View>

          <View style={styles.bulletRow}>
            <MaterialIcons name="warning" size={22} color={colors.warning} />
            <ThemedText style={styles.bulletText}>
              {t("deleteAccountBulletSubscription")}
            </ThemedText>
          </View>

          <View style={styles.bulletRow}>
            <MaterialIcons name="warning" size={22} color={colors.warning} />
            <ThemedText style={styles.bulletText}>
              {termsBefore}
              <ThemedText
                variant="link"
                onPress={() => WebBrowser.openBrowserAsync(config.termsUrl)}
                accessibilityRole="link"
              >
                {t("termsOfService")}
              </ThemedText>
              {termsAfter}
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <PrimaryButton
          title={t("continue")}
          onPress={() => router.push(Routes.deleteAccountExport)}
        />
        <PrimaryButton
          title={t("cancel")}
          variant="outline"
          onPress={() => router.back()}
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
  title: {
    marginBottom: Spacing.sm,
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
