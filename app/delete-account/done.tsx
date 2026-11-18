import { PrimaryButton, ThemedText, ThemedView } from "@/components";
import { Spacing, Typography } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { useThemeColor } from "@/hooks/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DeleteAccountDoneScreen() {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const { logout } = useAuth();

  return (
    <>
      {/* No back: the account is already gone, there's nothing to return to */}
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          <View style={styles.content}>
            <MaterialIcons name="check-circle" size={64} color={colors.success} />
            <ThemedText variant="title" style={styles.title}>
              {t("deleteAccountDoneTitle")}
            </ThemedText>
            <ThemedText style={[styles.message, { color: colors.textSecondary }]}>
              {t("deleteAccountDoneMessage")}
            </ThemedText>
          </View>

          <View style={styles.actions}>
            {/* The guard in app/_layout.tsx swaps this screen for `index` as
                soon as `authenticated` flips to false. */}
            <PrimaryButton title={t("deleteAccountDoneCta")} onPress={logout} />
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
    gap: Spacing.md,
  },
  title: {
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    fontSize: Typography.fontSize.base,
    lineHeight: 22,
  },
  actions: {
    width: "100%",
  },
});
