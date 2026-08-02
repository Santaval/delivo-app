import { BorderRadius, Spacing, Typography } from "@/constants";
import { useThemeColor } from "@/hooks/useColorScheme";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { EmptyState } from "./feedback/EmptyState";
import { ErrorState } from "./feedback/ErrorState";
import { ListSkeleton } from "./feedback/Skeleton";
import { RouteCard } from "./RouteCard";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

type TabType = "all" | "created" | "started" | "completed";

export type RoutesListProps = {
  routes: Route[];
  onRoutePress?: (routeId: string) => void;
  onRouteDetailsPress?: (routeId: string) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  loading?: boolean;
  error?: string | null;
  onCreateFirst?: () => void;
};

export function RoutesList({
  routes,
  onRoutePress,
  onRouteDetailsPress,
  isRefreshing,
  onRefresh,
  loading,
  error,
  onCreateFirst,
}: RoutesListProps) {
  const colors = useThemeColor();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const { t } = useTranslation();

  const tabs: { key: TabType; label: string }[] = [
    { key: "all", label: t("all") },
    { key: "created", label: t("created") },
    { key: "started", label: t("started") },
    { key: "completed", label: t("completed") },
  ];

  // Filter routes based on active tab
  const filteredRoutes = useMemo(() => {
    switch (activeTab) {
      case "created":
        return routes.filter((route) => route.status === "CREATED");
      case "started":
        return routes.filter((route) => route.status === "STARTED");
      case "completed":
        return routes.filter((route) => route.status === "COMPLETED");
      case "all":
      default:
        return routes;
    }
  }, [routes, activeTab]);

  const getTabCount = (tab: TabType) => {
    switch (tab) {
      case "created":
        return routes.filter((route) => route.status === "CREATED").length;
      case "started":
        return routes.filter((route) => route.status === "STARTED").length;
      case "completed":
        return routes.filter((route) => route.status === "COMPLETED").length;
      case "all":
      default:
        return routes.length;
    }
  };

  const renderTabButton = (tab: { key: TabType; label: string }) => {
    const isActive = activeTab === tab.key;
    const count = getTabCount(tab.key);

    return (
      <TouchableOpacity
        key={tab.key}
        style={[
          styles.tabButton,
          isActive && styles.tabButtonActive,
          {
            backgroundColor: isActive
              ? colors.primary
              : colors.backgroundSecondary,
            borderColor: isActive ? colors.primary : colors.border,
          },
        ]}
        onPress={() => setActiveTab(tab.key)}
        activeOpacity={0.8}
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
              {
                backgroundColor: isActive
                  ? colors.textInverse
                  : colors.textTertiary,
              },
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
  };

  const renderEmptyState = () => (
    <EmptyState
      icon="map"
      title={t("noRoutesYet")}
      subtitle={activeTab === "all" ? t("noRoutesYetSubtitle") : undefined}
      actionLabel={
        activeTab === "all" && onCreateFirst ? t("createRoute") : undefined
      }
      onAction={activeTab === "all" ? onCreateFirst : undefined}
    />
  );

  return (
    <ThemedView style={styles.container}>
      {/* Filter Tabs */}
      <View style={[styles.tabsContainer]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map(renderTabButton)}
        </ScrollView>
      </View>

      {/* Routes List */}
      <ScrollView
        style={styles.routesContainer}
        contentContainerStyle={styles.routesContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ListSkeleton />
        ) : error && routes.length === 0 ? (
          <ErrorState message={error} onRetry={onRefresh} />
        ) : filteredRoutes.length > 0 ? (
          filteredRoutes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              onPress={onRoutePress}
              onDetailsPress={onRouteDetailsPress}
            />
          ))
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  tabsContainer: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  tabsContent: {
    paddingHorizontal: Spacing.lg,
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
  tabButtonActive: {
    // Active styles are handled inline with colors
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
  routesContainer: {
    flex: 1,
  },
  routesContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.sm,
    textAlign: "center",
    lineHeight: 20,
  },
});
