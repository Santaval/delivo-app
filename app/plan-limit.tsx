import { PrimaryButton, ThemedText, ThemedView } from "@/components";
import { Spacing, Typography } from "@/constants";
import { usePlanLimit } from "@/context/PlanLimitContext";
import { usePurchases } from "@/context/PurchasesContext";
import { useToast } from "@/context/ToastContext";
import { useThemeColor } from "@/hooks/useColorScheme";
import RevenueCatService from "@/services/purchases/RevenueCat.service";
import { Stack, router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import type { CustomerInfo } from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlanLimitScreen() {
  const { payload, clearPlanLimit } = usePlanLimit();
  const { refreshCustomerInfo } = usePurchases();
  const { show } = useToast();
  const { t } = useTranslation();
  const colors = useThemeColor();
  const [showPaywall, setShowPaywall] = useState(false);

  // Release the interceptor's guard once this screen goes away, however it goes
  useEffect(() => clearPlanLimit, [clearPlanLimit]);

  const tier = payload?.tier ?? t("freePlan");
  // Falls back to the raw resource name when the API sends one we don't localize
  const resource = payload?.resource
    ? t(`planResource_${payload.resource}`, { defaultValue: payload.resource })
    : "";

  const hasCounts =
    payload?.used !== null &&
    payload?.used !== undefined &&
    payload?.limit !== null &&
    payload?.limit !== undefined;

  const message =
    hasCounts && resource
      ? t("planLimitMessage", {
          used: payload!.used,
          limit: payload!.limit,
          resource,
          tier,
        })
      : t("planLimitMessageGeneric", { tier });

  const dismiss = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }, []);

  // Fires for both purchases and restores; only leave once the entitlement is live
  const handleEntitlementGranted = useCallback(
    ({ customerInfo }: { customerInfo: CustomerInfo }) => {
      refreshCustomerInfo();
      if (RevenueCatService.isProActive(customerInfo)) {
        show({ message: t("planUpgradedRetry"), type: "success" });
        dismiss();
      }
    },
    [refreshCustomerInfo, show, t, dismiss],
  );

  const handlePurchaseError = useCallback(() => {
    show({ message: t("genericError"), type: "error" });
  }, [show, t]);

  if (showPaywall) {
    return (
      <>
        {/* Header guarantees a way out even when the paywall renders no close button */}
        <Stack.Screen
          options={{ headerShown: true, title: t("upgradeToPro"), headerBackTitle: t("back") }}
        />
        <RevenueCatUI.Paywall
          style={styles.paywall}
          onPurchaseCompleted={handleEntitlementGranted}
          onRestoreCompleted={handleEntitlementGranted}
          onPurchaseError={handlePurchaseError}
          onRestoreError={handlePurchaseError}
          onDismiss={() => setShowPaywall(false)}
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          <View style={styles.content}>
            <ThemedText style={[styles.title, { color: colors.text }]}>
              {t("planLimitTitle")}
            </ThemedText>

            <ThemedText style={[styles.message, { color: colors.textSecondary }]}>
              {message}
            </ThemedText>
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              title={t("upgradeToPro")}
              onPress={() => setShowPaywall(true)}
            />

            <PrimaryButton
              title={t("notNow")}
              onPress={dismiss}
              variant="outline"
              style={styles.dismissButton}
            />
          </View>
        </ThemedView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.semibold,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: Typography.fontSize.base,
    textAlign: "center",
    lineHeight: 24,
  },
  actions: {
    width: "100%",
  },
  dismissButton: {
    marginTop: Spacing.md,
  },
  paywall: {
    flex: 1,
  },
});
