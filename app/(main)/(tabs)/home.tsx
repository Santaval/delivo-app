import {
  EmptyState,
  ErrorState,
  IncomeCard,
  IncomeTrendsChart,
  PrimaryButton,
  QuickLinks,
  SkeletonBox,
} from "@/components";
import { HomeHeader } from "@/components/navigation/HomeHeader";
import { BorderRadius, Routes, Spacing } from "@/constants";
import { useTabBarInset, useThemeColor } from "@/hooks";
import useFinancialSummary from "@/hooks/useFinanancialSummary";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const { data, loading, error, refresh } = useFinancialSummary();
  const { t } = useTranslation();

  const colors = useThemeColor();
  const tabBarInset = useTabBarInset();

  // All three states render the same <HomeHeader /> so it doesn't jump between them.
  if (loading) {
    const shimmerColor = colors.backgroundSecondary;
    return (
      <SafeAreaView style={styles.container}>
        <HomeHeader />
        <SkeletonBox
          style={[styles.skeletonCard, { backgroundColor: shimmerColor }]}
        />
        <SkeletonBox
          style={[styles.skeletonChart, { backgroundColor: shimmerColor }]}
        />
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <HomeHeader />
        <ErrorState message={error ?? undefined} onRetry={refresh} />
      </SafeAreaView>
    );
  }

  const isGettingStarted = data.incomes.total === 0;

  return (
    <SafeAreaView style={styles.container}>
      <HomeHeader />
      {/* The page scrolls as a whole: income card + chart + actions overflow a
          compact screen, and the iOS tab bar is absolutely positioned over it. */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarInset }]}
        showsVerticalScrollIndicator={false}
      >
        <IncomeCard
          amount={data.incomes.total}
          title={t("monthlyIncome")}
          percentage={data.incomes.increasePercentage || 0}
          timeStamp={t("sinceLastMonth")}
        />

        <QuickLinks
          title={t("quickActions")}
          links={[
            {
              icon: (
                <MaterialIcons
                  name="add-shopping-cart"
                  size={24}
                  color={colors.textInverse}
                />
              ),
              id: "create-order",
              title: t("createOrder"),
              subtitle: t("createOrderSubtitle"),
              onPress: () => router.push(Routes.ordersCreate),
            },
            {
              icon: (
                <MaterialIcons
                  name="add-box"
                  size={24}
                  color={colors.textInverse}
                />
              ),
              id: "create-product",
              title: t("createProduct"),
              subtitle: t("createProductSubtitle"),
              onPress: () => router.push(Routes.productsAdd),
            },

            {
              icon: (
                <MaterialCommunityIcons
                  name="map-plus"
                  size={24}
                  color={colors.textInverse}
                />
              ),
              id: "create-route",
              title: t("createRoute"),
              subtitle: t("createRouteSubtitle"),
              onPress: () => router.push(Routes.routesCreate),
            },

            {
              icon: (
                <MaterialIcons
                  name="person-add"
                  size={24}
                  color={colors.textInverse}
                />
              ),
              id: "add-client",
              title: t("addClient"),
              subtitle: t("addClientSubtitle"),
              onPress: () => router.push(Routes.clientsAdd),
            },
          ]}
        />

        {isGettingStarted ? (
          <View style={styles.gettingStarted}>
            <EmptyState
              icon="storefront"
              title={t("gettingStartedTitle")}
              subtitle={t("gettingStartedSubtitle")}
              actionLabel={t("addFirstClient")}
              onAction={() => router.push(Routes.clientsAdd)}
            />
            <PrimaryButton
              title={t("addFirstProduct")}
              variant="outline"
              onPress={() => router.push(Routes.productsAdd)}
              style={styles.secondaryCta}
            />
          </View>
        ) : (
          <>
            <IncomeTrendsChart
              data={
                Object.entries(data.incomes.byDay).map(([label, value]) => ({
                  label,
                  value,
                })) as any
              }
              title={t("incomeTrends")}
              averageValue={data.incomes.averagePerDay}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.lg, // header ↔ body; the ScrollView spaces its own cards
  },
  content: {
    gap: Spacing["3xl"],
    // paddingBottom comes from useTabBarInset (clears the floating tab bar).
  },
  skeletonCard: {
    height: 120,
    borderRadius: BorderRadius.xl,
  },
  skeletonChart: {
    height: 220,
    borderRadius: BorderRadius.xl,
  },
  gettingStarted: {
    gap: Spacing.sm,
  },
  secondaryCta: {
    marginHorizontal: Spacing.xl,
  },
});
