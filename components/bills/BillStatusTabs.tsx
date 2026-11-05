import { BorderRadius, Spacing, Typography } from "@/constants";
import { useThemeColor } from "@/hooks/useColorScheme";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../ThemedText";

export type BillStatusTabsProps = {
  value: BillsStatusFilter;
  onChange: (status: BillsStatusFilter) => void;
  /** Badge counts per tab; badges are hidden when omitted or zero. */
  counts?: Partial<BillsCounts> | null;
};

export function BillStatusTabs({ value, onChange, counts }: BillStatusTabsProps) {
  const colors = useThemeColor();
  const { t } = useTranslation();

  const tabs: { key: BillsStatusFilter; label: string }[] = [
    { key: "ALL", label: t("all") },
    { key: "PAID", label: t("paid") },
    { key: "PENDING", label: t("pending") },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {tabs.map((tab) => {
          const isActive = value === tab.key;
          const count = counts?.[tab.key] ?? 0;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                {
                  backgroundColor: isActive ? colors.primary : colors.backgroundSecondary,
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
              onPress={() => onChange(tab.key)}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  isActive && styles.tabTextActive,
                  { color: isActive ? colors.textInverse : colors.text },
                ]}
              >
                {tab.label}
              </ThemedText>
              {count > 0 && (
                <View
                  style={[
                    styles.tabBadge,
                    { backgroundColor: isActive ? colors.textInverse : colors.textTertiary },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.tabBadgeText,
                      { color: isActive ? colors.primary : colors.textInverse },
                    ]}
                  >
                    {count}
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  content: {
    gap: Spacing.sm,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  tabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  tabTextActive: {
    fontWeight: Typography.fontWeight.semibold,
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
});
