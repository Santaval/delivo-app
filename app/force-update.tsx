import { PrimaryButton, ThemedText, ThemedView } from "@/components";
import config from "@/config/env";
import { getAppVersion } from "@/constants/version";
import { useVersion } from "@/context/VersionContext";
import { Spacing, Typography } from "@/constants";
import { useThemeColor } from "@/hooks/useColorScheme";
import * as Linking from "expo-linking";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForceUpdateScreen() {
  const { recheck } = useVersion();
  const { t } = useTranslation();
  const colors = useThemeColor();
  const currentVersion = getAppVersion();

  const openStore = async () => {
    const url = Platform.OS === "ios" ? config.appStoreUrl : config.playStoreUrl;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch {
      // Best-effort open — no surfacing: the user is already on a blocking
      // screen and can retry via the dedicated button.
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          <View style={styles.content}>
            <ThemedText style={[styles.title, { color: colors.text }]}>
              {t("forceUpdateTitle")}
            </ThemedText>

            <ThemedText
              style={[styles.message, { color: colors.textSecondary }]}
            >
              {t("forceUpdateMessage", {
                currentVersion,
              })}
            </ThemedText>
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              title={t("forceUpdateAction")}
              onPress={openStore}
              fullWidth
              size="large"
            />

            <PrimaryButton
              title={t("forceUpdateRetry")}
              onPress={recheck}
              variant="outline"
              fullWidth
              style={styles.retryButton}
            />
          </View>
        </ThemedView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.semibold,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: Typography.fontSize.base,
    textAlign: "center",
    lineHeight: 24,
  },
  actions: {
    width: "100%",
  },
  retryButton: {
    marginTop: Spacing.md,
  },
});