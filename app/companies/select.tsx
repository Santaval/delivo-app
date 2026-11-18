import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText, ThemedView } from "../../components";
import { CompanyList } from "../../components/companies/CompanyList";
import { Spacing, Typography } from "../../constants";
import { useCompanies } from "../../context/CompaniesContext";
import { toast } from "../../context/ToastContext";
import { useColorScheme, useThemeColor } from "../../hooks/useColorScheme";

export default function CompanySelectPage() {
  const { t } = useTranslation();
  const { companies, selectCompany, activeCompany } = useCompanies();
  const colors = useThemeColor();
  const scheme = useColorScheme();

  const handleSelectCompany = async (companyId: string) => {
    try {
      // No redirect here: once the company resolves into activeCompany the
      // guard in app/_layout.tsx swaps this screen for the app stack.
      await selectCompany(companyId);
    } catch (error) {
      toast.error(t("failedToSelectCompany"));
    }
  };

  if (!companies || companies.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <StatusBar
          barStyle={scheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />
        <ThemedView style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText
            style={[styles.loadingText, { color: colors.textSecondary }]}
          >
            {t("loadingCompanies")}
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: colors.text }]}>
            {t("selectCompany")}
          </ThemedText>
          <ThemedText
            style={[styles.subtitle, { color: colors.textSecondary }]}
          >
            {t("chooseCompanyToWorkWith")}
          </ThemedText>
        </View>

        <CompanyList
          companies={companies}
          activeCompanyId={activeCompany?.id}
          onSelect={handleSelectCompany}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
  },
  header: {
    padding: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    lineHeight: 22,
  },
});
