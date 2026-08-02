import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText, ThemedView } from "../../components";
import { BorderRadius, Shadows, Spacing, Typography } from "../../constants";
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

  const getCompanyInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
  };

  const getCompanyId = (company: Company) => {
    // Generate a formatted company ID for display
    const idNumber = company.id.slice(-4);
    return `ID: 3-101-${idNumber}`;
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

        <View style={styles.companiesList}>
          {companies.map((company) => {
            const isSelected = activeCompany?.id === company.id;
            return (
              <TouchableOpacity
                key={company.id}
                style={[
                  styles.companyCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                  isSelected && {
                    borderColor: colors.primary,
                    backgroundColor: colors.surface,
                  },
                ]}
                onPress={() => handleSelectCompany(company.id)}
                activeOpacity={0.8}
              >
                <View style={styles.companyContent}>
                  <View
                    style={[
                      styles.companyAvatar,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : colors.backgroundTertiary,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.companyAvatarText,
                        {
                          color: isSelected ? colors.textInverse : colors.text,
                        },
                      ]}
                    >
                      {getCompanyInitials(company.name)}
                    </ThemedText>
                  </View>

                  <View style={styles.companyInfo}>
                    <ThemedText
                      style={[styles.companyName, { color: colors.text }]}
                    >
                      {company.name}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.companyId,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {getCompanyId(company)}
                    </ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
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
  companiesList: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  companyCard: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    ...Shadows.small,
  },
  companyContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  companyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  companyAvatarText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 2,
  },
  companyId: {
    fontSize: Typography.fontSize.sm,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  addButtonContainer: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  addButton: {
    width: "100%",
  },
});
