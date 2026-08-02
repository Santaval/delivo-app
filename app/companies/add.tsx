import { useAuth } from "@/context/AuthContext";
import { useCompanies } from "@/context/CompaniesContext";
import { useToast } from "@/context/ToastContext";
import CompaniesService from "@/services/companies/Companies.service";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
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
import { BorderRadius, Colors, Routes, Spacing, Typography } from "../../constants";

export default function AddCompanyPage() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { selectCompany } = useCompanies();
  const { refreshUser } = useAuth();
  const toast = useToast();

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
      router.replace(Routes.companiesSelect);
    } catch (error) {
      toast.show({ message: t("failedToCreateCompany"), type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.light.background}
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
            <View style={styles.iconBadge}>
              <MaterialIcons
                name="business"
                size={32}
                color={Colors.light.primary}
              />
            </View>
            <ThemedText style={styles.title}>
              {t("createCompanyWelcomeTitle")}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
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
    backgroundColor: Colors.light.background,
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
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
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
