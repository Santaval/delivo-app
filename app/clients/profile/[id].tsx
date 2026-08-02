import {
  FloatingActionButton,
  LoadingState,
  PrimaryButton,
  ThemedText,
  ThemedView,
  TopBar,
} from "@/components";
import ClientBills from "@/components/clients/ClientBills";
import ClientCompactCard from "@/components/clients/ClientCompactCard";
import ClientLocationView from "@/components/clients/ClientLocationView";
import ClientOrders from "@/components/clients/ClientOrders";
import { BorderRadius, ClientsProfileParams, Routes, Shadows, Spacing, Typography } from "@/constants";
import useClient from "@/hooks/useClient";
import { useThemeColor } from "@/hooks/useColorScheme";
import useCustomerOrders from "@/hooks/useCustomerOrders";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TabType = "bills" | "location" | "orders";

export default function ClientProfile() {
  const { id } = useLocalSearchParams<ClientsProfileParams>();
  const colors = useThemeColor();
  const { client, isInitialLoading, isMutating, error, refreshClient, updateLocation, deleteClient } =
    useClient(id);
  const [activeTab, setActiveTab] = useState<TabType>("bills");
  const {
    orders,
    loading: ordersLoading,
    refreshOrders,
  } = useCustomerOrders(id);
  const { t } = useTranslation();

  const handleCall = () => {
    if (client?.phoneNumber) {
      Linking.openURL(`tel:${client.phoneNumber}`).catch((err) => {
        console.error("Error making call:", err);
        Alert.alert(t("error"), t("couldNotOpenPhoneApplication"));
      });
    }
  };

  const handleWhatsApp = () => {
    if (client?.phoneNumber) {
      const phoneNumber = client.phoneNumber.replace(/[^0-9]/g, "");
      Linking.openURL(`whatsapp://send?phone=${phoneNumber}`).catch((err) => {
        console.error("Error opening WhatsApp:", err);
        Alert.alert(
          t("error"),
          t("couldNotOpenWhatsApp"),
        );
      });
    }
  };

  const handleEdit = () => {
    router.push(Routes.clientEdit(id));
  };

  const handleDelete = () => {
    Alert.alert(
      t("deleteClient"),
      t("deleteClientConfirmation"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteClient();
              router.back();
            } catch {
              Alert.alert(t("error"), t("failedToDeleteClient"));
            }
          },
        },
      ]
    );
  };

  const handleEmail = () => {
    if (client?.email) {
      Linking.openURL(`mailto:${client.email}`).catch((err) => {
        console.error("Error opening email:", err);
        Alert.alert(t("error"), t("couldNotOpenEmailApplication"));
      });
    }
  };

  if (isInitialLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <TopBar title={t("clientProfile")} showBack backTo={Routes.clients} />
        <LoadingState message={t('loading')} />
      </ThemedView>
    );
  }

  if (!client) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <TopBar title={t("clientProfile")} showBack backTo={Routes.clients} />
        <View style={styles.centerContent}>
          <MaterialIcons name="error-outline" size={48} color={colors.danger} />
          <ThemedText style={[styles.errorText, { color: colors.danger }]}>
            {error || t("clientNotFound")}
          </ThemedText>
          <PrimaryButton
            title={t("tryAgain")}
            onPress={refreshClient}
            style={styles.retryButton}
          />
        </View>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <TopBar title={t("clientProfile")} showBack backTo={Routes.clients} />

      <View style={styles.contentWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={ordersLoading}
              onRefresh={refreshOrders}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Client Info Card */}
          <ClientCompactCard client={client} />

          {/* Edit / Delete actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={handleEdit}
              activeOpacity={0.7}
            >
              <MaterialIcons name="edit" size={18} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                {t("edit")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.danger + "55" }]}
              onPress={handleDelete}
              activeOpacity={0.7}
              disabled={isMutating}
            >
              <MaterialIcons name="delete-outline" size={18} color={colors.danger} />
              <Text style={[styles.actionButtonText, { color: colors.danger }]}>
                {t("delete")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "orders" && styles.activeTab,
                activeTab === "orders" && { borderBottomColor: colors.primary },
              ]}
              onPress={() => setActiveTab("orders")}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: colors.textSecondary },
                  activeTab === "orders" && styles.activeTabText,
                  activeTab === "orders" && { color: colors.primary },
                ]}
              >
                {t("orders")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "bills" && styles.activeTab,
                activeTab === "bills" && { borderBottomColor: colors.primary },
              ]}
              onPress={() => setActiveTab("bills")}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: colors.textSecondary },
                  activeTab === "bills" && styles.activeTabText,
                  activeTab === "bills" && { color: colors.primary },
                ]}
              >
                {t("bills")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "location" && styles.activeTab,
                activeTab === "location" && { borderBottomColor: colors.primary },
              ]}
              onPress={() => setActiveTab("location")}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: colors.textSecondary },
                  activeTab === "location" && styles.activeTabText,
                  activeTab === "location" && { color: colors.primary },
                ]}
              >
                {t("location")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === "bills" && <ClientBills clientId={client.id} />}

          {activeTab === "orders" && <ClientOrders clientId={client.id} />}

          {activeTab === "location" && (
            <View style={styles.tabContent}>
              <ClientLocationView
                client={client}
                onUpdateLocation={updateLocation}
              />
            </View>
          )}
        </ScrollView>
        {isMutating && (
          <View
            style={styles.mutatingOverlay}
            pointerEvents="auto"
            accessibilityLabel={t('updating')}
          >
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </View>

      <FloatingActionButton
        icon="add-shopping-cart"
        onPress={() => {
          router.push(Routes.orderCreate(client.id));
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  mutatingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: Spacing.xl * 4, // Extra space for contact buttons
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
    textAlign: "center",
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    textAlign: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
  },
  clientInfoCard: {
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    ...Shadows.small,
  },
  clientAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  clientAvatarText: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs / 2,
  },
  clientPhone: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs / 2,
  },
  clientEmail: {
    fontSize: Typography.fontSize.sm,
  },
  balanceCard: {
    padding: Spacing.xl,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    ...Shadows.small,
  },
  balanceLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    fontSize: Typography.fontSize["4xl"],
    fontWeight: Typography.fontWeight.bold,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {},
  tabText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  activeTabText: {
    fontWeight: Typography.fontWeight.semibold,
  },
  tabContent: {
    paddingHorizontal: Spacing.lg,
  },
  statusChips: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  allChip: {},
  chipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  allChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  chipBadge: {
    borderRadius: BorderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xs,
  },
  pendingBadge: {},
  chipBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  loadingContainer: {
    paddingVertical: Spacing.xl * 2,
    alignItems: "center",
  },
  ordersList: {
    gap: Spacing.md,
  },
  orderItem: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  orderStatusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.sm,
  },
  orderStatusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    textTransform: "uppercase",
  },
  paidStatus: {},
  pendingStatus: {},
  orderAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  orderNumber: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs / 2,
  },
  orderDate: {
    fontSize: Typography.fontSize.sm,
  },
  emptyContainer: {
    paddingVertical: Spacing.xl * 2,
    alignItems: "center",
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
  },
  contactButtonsContainer: {
    position: "absolute",
    bottom: Spacing.xl * 4,
    left: Spacing.lg,
    flexDirection: "column",
    gap: Spacing.sm,
    ...Shadows.medium,
  },
  contactButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.small,
  },
  actionsRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Shadows.small,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
});
