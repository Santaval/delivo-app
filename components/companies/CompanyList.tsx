import { ThemedText } from "@/components/ThemedText";
import { BorderRadius, Shadows, Spacing, Typography } from "@/constants";
import { useThemeColor } from "@/hooks/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type CompanyListProps = {
  companies: Company[];
  activeCompanyId?: string | null;
  onSelect: (companyId: string) => void;
};

const getCompanyInitials = (name: string) =>
  name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2);

/** Company cards shared by the onboarding selector and the in-app switcher. */
export function CompanyList({ companies, activeCompanyId, onSelect }: CompanyListProps) {
  const colors = useThemeColor();

  return (
    <View style={styles.companiesList}>
      {companies.map((company) => {
        const isSelected = activeCompanyId === company.id;
        return (
          <TouchableOpacity
            key={company.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            style={[
              styles.companyCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isSelected && { borderColor: colors.primary, backgroundColor: colors.surface },
            ]}
            onPress={() => onSelect(company.id)}
            activeOpacity={0.8}
          >
            <View style={styles.companyContent}>
              <View
                style={[
                  styles.companyAvatar,
                  { backgroundColor: isSelected ? colors.primary : colors.backgroundTertiary },
                ]}
              >
                <ThemedText
                  style={[
                    styles.companyAvatarText,
                    { color: isSelected ? colors.textInverse : colors.text },
                  ]}
                >
                  {getCompanyInitials(company.name)}
                </ThemedText>
              </View>

              <View style={styles.companyInfo}>
                <ThemedText style={[styles.companyName, { color: colors.text }]}>
                  {company.name}
                </ThemedText>
              </View>
              {isSelected && (
                <MaterialIcons name="check-circle" size={24} color={colors.primary} />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
});
