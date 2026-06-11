import {
  FloatingActionButton,
  PrimaryButton,
  ThemedText,
  ThemedView,
  TopBar,
} from "@/components";
import ClientBills from "@/components/clients/ClientBills";
import ClientCompactCard from "@/components/clients/ClientCompactCard";
import ClientLocationView from "@/components/clients/ClientLocationView";
import ClientOrders from "@/components/clients/ClientOrders";
import { BorderRadius, Shadows, Spacing, Typography } from "@/constants";
import { Colors } from "@/constants/Colors";
import useClient from "@/hooks/useClient";
import { useThemeColor } from "@/hooks/useColorScheme";
import useCustomerOrders from "@/hooks/useCustomerOrders";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColor();
  const { client, loading, error, refreshClient, updateLocation, deleteClient } =
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
    router.push(`/clients/edit/${id}`);
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

  if (loading) {
    return <Text>{t("loading")}...</Text>;
  }

  if (error || !client) {
    return (
      <ThemedView style={styles.container}>
        <TopBar title={t("clientProfile")} />
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
    <SafeAreaView style={styles.container}>
      <TopBar title={t("clientProfile")} />

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
            style={[styles.actionButton, { borderColor: colors.border }]}
            onPress={handleEdit}
            activeOpacity={0.7}
          >
            <MaterialIcons name="edit" size={18} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>
              {t("edit")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.danger + "55" }]}
            onPress={handleDelete}
            activeOpacity={0.7}
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
            style={[styles.tab, activeTab === "orders" && styles.activeTab]}
            onPress={() => setActiveTab("orders")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "orders" && styles.activeTabText,
              ]}
            >
              {t("orders")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "bills" && styles.activeTab]}
            onPress={() => setActiveTab("bills")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "bills" && styles.activeTabText,
              ]}
            >
              {t("bills")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "location" && styles.activeTab]}
            onPress={() => setActiveTab("location")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "location" && styles.activeTabText,
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

      <FloatingActionButton
        icon="add-shopping-cart"
        onPress={() => {
          router.push(`/orders/create?clientId=${client.id}`);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
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
    color: Colors.light.textSecondary,
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
    backgroundColor: Colors.light.background,
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
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  clientAvatarText: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.textInverse,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs / 2,
  },
  clientPhone: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs / 2,
  },
  clientEmail: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  balanceCard: {
    backgroundColor: Colors.light.background,
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
    color: Colors.light.textSecondary,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    fontSize: Typography.fontSize["4xl"],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
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
  activeTab: {
    borderBottomColor: Colors.light.primary,
  },
  tabText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.textSecondary,
  },
  activeTabText: {
    color: Colors.light.primary,
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
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: Spacing.xs,
  },
  allChip: {
    backgroundColor: Colors.light.primary + "15",
    borderColor: Colors.light.primary,
  },
  chipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  allChipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  chipBadge: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xs,
  },
  pendingBadge: {
    backgroundColor: Colors.light.backgroundSecondary,
  },
  chipBadgeText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textInverse,
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
    backgroundColor: Colors.light.background,
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
    backgroundColor: Colors.light.backgroundSecondary,
  },
  orderStatusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.textSecondary,
    textTransform: "uppercase",
  },
  paidStatus: {
    color: Colors.light.success,
  },
  pendingStatus: {
    color: Colors.light.warning,
  },
  orderAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  orderNumber: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs / 2,
  },
  orderDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  emptyContainer: {
    paddingVertical: Spacing.xl * 2,
    alignItems: "center",
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
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
    backgroundColor: Colors.light.background,
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
    backgroundColor: Colors.light.background,
    ...Shadows.small,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
});
