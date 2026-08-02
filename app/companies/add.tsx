import { useAuth } from "@/context/AuthContext";
import { useCompanies } from "@/context/CompaniesContext";
import { useToast } from "@/context/ToastContext";
import CompaniesService from "@/services/companies/Companies.service";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FormField, PrimaryButton, ThemedText } from "../../components";
import { BorderRadius, Spacing, Typography } from "../../constants";
import { useColorScheme, useThemeColor } from "../../hooks/useColorScheme";

export default function AddCompanyPage() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { selectCompany } = useCompanies();
  const { refreshUser } = useAuth();
  const toast = useToast();
  const colors = useThemeColor();
  const scheme = useColorScheme();

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.show({ message: t("companyNameIsRequired"), type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const company = await CompaniesService.create(name);
      // Persist the id + header first, then refresh so `companies` picks up the
      // new company and CompaniesContext can resolve it into activeCompany —
      // which is what triggers the RevenueCat login for it.
      await selectCompany(company.id);
      await refreshUser();
      // No redirect here: once the company resolves into activeCompany the
      // guard in app/_layout.tsx swaps this screen for the app stack.
    } catch (error) {
      toast.show({ message: t("failedToCreateCompany"), type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          <View style={styles.welcome}>
            <View style={[styles.iconBadge, { backgroundColor: colors.backgroundSecondary }]}>
              <MaterialIcons
                name="business"
                size={32}
                color={colors.primary}
              />
            </View>
            <ThemedText style={[styles.title, { color: colors.text }]}>
              {t("createCompanyWelcomeTitle")}
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t("createCompanyWelcomeSubtitle")}
            </ThemedText>
          </View>

          <View style={styles.form}>
            <FormField
              label={t("companyName")}
              value={name}
              onChangeText={setName}
              placeholder={t("enterCompanyName")}
              required
              autoCapitalize="words"
            />
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={isLoading ? t("creatingCompany") : t("createCompany")}
            onPress={handleSubmit}
            disabled={isLoading || !name.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingTop: Spacing["3xl"],
  },
  welcome: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },
  form: {
    gap: Spacing.lg,
  },
  buttonContainer: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
});
