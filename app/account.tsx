import { ThemedText } from '@/components/ThemedText';
import { TopBar } from '@/components/TopBar';
import { Routes, Spacing, Typography } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useCompanies } from '@/context/CompaniesContext';
import { usePurchases } from '@/context/PurchasesContext';
import { useToast } from '@/context/ToastContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import MeService from '@/services/users/Me.service';
import { confirmDestructive } from '@/utils/confirm';
import { formatMemberCode } from '@/utils/memberCode';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountScreen() {
  const { user, logout, refreshUser } = useAuth();
  const { activeCompany } = useCompanies();
  const { t } = useTranslation();
  const toast = useToast();
  const colors = useThemeColor();
  const {
    isPro,
    isLoading,
    error,
    offerings,
    presentPaywall,
    presentCustomerCenter,
    restorePurchases,
  } = usePurchases();

  const [isRegenerating, setIsRegenerating] = useState(false);
  const formattedCode = formatMemberCode(user?.memberCode);

  const handleShareCode = async () => {
    if (!formattedCode) return;
    try {
      await Share.share({ message: t('memberCodeShareMessage', { code: formattedCode }) });
    } catch {
      // The share sheet failing to open is not worth a toast
    }
  };

  const regenerateCode = async () => {
    setIsRegenerating(true);
    try {
      const newCode = await MeService.regenerateMemberCode();
      await refreshUser();
      toast.show({
        message: t('memberCodeRegenerated', { code: formatMemberCode(newCode) }),
        type: 'success',
      });
    } catch (e: any) {
      toast.show({
        message:
          e?.response?.status === 429
            ? t('memberCodeRegenerateRateLimited')
            : t('memberCodeRegenerateFailed'),
        type: 'error',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRegenerateCode = () => {
    confirmDestructive({
      title: t('memberCodeRegenerateConfirmTitle'),
      message: t('memberCodeRegenerateConfirmMessage'),
      confirmLabel: t('memberCodeRegenerate'),
      onConfirm: regenerateCode,
    });
  };

  const handleUpgrade = async () => {
    await presentPaywall();
  };

  const handleManageSubscription = async () => {
    await presentCustomerCenter();
  };

  const handleRestorePurchases = async () => {
    const restored = await restorePurchases();
    toast.show({
      message: restored ? t('purchasesRestoredMessage') : t('nothingToRestore'),
      type: restored ? 'success' : 'info',
    });
  };

  const handleLogout = () => {
    confirmDestructive({
      title: t('signOut'),
      message: t('signOutConfirmMessage'),
      confirmLabel: t('signOut'),
      onConfirm: logout,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title={t('account')} showBack backTo={Routes.home} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.backgroundTertiary }]}>
            <MaterialIcons name="person" size={24} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <ThemedText style={styles.userName} numberOfLines={1}>
              {user?.name} {user?.surnames}
            </ThemedText>
            <ThemedText style={[styles.userEmail, { color: colors.textSecondary }]} numberOfLines={1}>
              {user?.email}
            </ThemedText>
          </View>
        </View>

        {/* Member code */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="badge" size={24} color={colors.primary} />
            <ThemedText variant="subtitle" style={styles.cardTitle}>
              {t('memberCodeTitle')}
            </ThemedText>
            {isRegenerating && <ActivityIndicator size="small" color={colors.primary} />}
          </View>
          <ThemedText
            style={[styles.memberCode, { color: colors.text }]}
            accessibilityLabel={user?.memberCode ? user.memberCode.split('').join(' ') : undefined}
            selectable
          >
            {formattedCode || t('memberCodeUnavailable')}
          </ThemedText>
          <ThemedText variant="caption" style={[styles.cardDescription, { color: colors.textSecondary }]}>
            {t('memberCodeDescription')}
          </ThemedText>
          <View style={styles.memberCodeActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton, styles.flexButton, { backgroundColor: colors.primary }, (!formattedCode || isRegenerating) && styles.disabled]}
              onPress={handleShareCode}
              disabled={!formattedCode || isRegenerating}
            >
              <MaterialIcons name="share" size={20} color="#fff" />
              <ThemedText style={styles.primaryButtonText}>{t('memberCodeShare')}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.outlineButton, styles.flexButton, { borderColor: colors.border }, isRegenerating && styles.disabled]}
              onPress={handleRegenerateCode}
              disabled={isRegenerating}
            >
              <MaterialIcons name="refresh" size={20} color={colors.textSecondary} />
              <ThemedText style={[styles.outlineButtonText, { color: colors.textSecondary }]}>
                {t('memberCodeRegenerate')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Subscription Status */}
        <View style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
          // Tinted from the warning colour so the "pro" highlight reads in both schemes
          isPro && { backgroundColor: colors.warning + '1A', borderColor: colors.warning },
        ]}>
          <View style={styles.cardHeader}>
            <MaterialIcons
              name={isPro ? 'star' : 'star-border'}
              size={24}
              color={isPro ? colors.warning : colors.textSecondary}
            />
            <ThemedText variant="subtitle" style={styles.cardTitle}>
              {isPro ? 'Delivo Pro' : t('freePlan')}
            </ThemedText>
            {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
          </View>

          {/* The plan is scoped to the company, not the account */}
          {activeCompany && (
            <ThemedText variant="caption" style={[styles.cardCompany, { color: colors.textSecondary }]}>
              {t('planForCompany', { company: activeCompany.name })}
            </ThemedText>
          )}

          {isPro ? (
            <ThemedText variant="caption" style={[styles.cardDescription, { color: colors.textSecondary }]}>
              {t('proFullAccess')}
            </ThemedText>
          ) : (
            <ThemedText variant="caption" style={[styles.cardDescription, { color: colors.textSecondary }]}>
              {t('upgradeToUnlock')}
            </ThemedText>
          )}

          {/* Offerings preview */}
          {!isPro && offerings && (
            <View style={styles.packagesContainer}>
              {offerings.availablePackages.map((pkg) => (
                <View key={pkg.identifier} style={[styles.packageRow, { borderTopColor: colors.border }]}>
                  <ThemedText variant="default" style={styles.packageTitle}>
                    {pkg.product.title}
                  </ThemedText>
                  <ThemedText variant="caption" style={[styles.packagePrice, { color: colors.primary }]}>
                    {pkg.product.priceString}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>

        {error && (
          <ThemedText variant="caption" style={[styles.errorText, { color: colors.danger }]}>
            {error}
          </ThemedText>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          {!isPro && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleUpgrade}
              disabled={isLoading}
            >
              <MaterialIcons name="upgrade" size={20} color="#fff" />
              <ThemedText style={styles.primaryButtonText}>
                {t('upgradeToPro')}
              </ThemedText>
            </TouchableOpacity>
          )}

          {isPro && (
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton, { backgroundColor: colors.backgroundTertiary, borderColor: colors.primary }]}
              onPress={handleManageSubscription}
              disabled={isLoading}
            >
              <MaterialIcons name="manage-accounts" size={20} color={colors.primary} />
              <ThemedText style={[styles.secondaryButtonText, { color: colors.primary }]}>
                {t('manageSubscription')}
              </ThemedText>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.outlineButton, { borderColor: colors.border }]}
            onPress={handleRestorePurchases}
            disabled={isLoading}
          >
            <MaterialIcons name="restore" size={20} color={colors.textSecondary} />
            <ThemedText style={[styles.outlineButtonText, { color: colors.textSecondary }]}>
              {t('restorePurchases')}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Sign Out — the main action at the bottom */}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.danger }]}
          onPress={handleLogout}
          accessibilityRole="button"
        >
          <MaterialIcons name="logout" size={20} color="#fff" />
          <ThemedText style={styles.primaryButtonText}>{t('signOut')}</ThemedText>
        </TouchableOpacity>

        {/* Delete Account — deliberately small and set well apart from Sign Out
            so it can't be hit by accident; the flow itself has confirm steps. */}
        <TouchableOpacity
          style={styles.deleteLink}
          onPress={() => router.push(Routes.deleteAccount)}
          accessibilityRole="button"
        >
          <ThemedText style={[styles.deleteLinkText, { color: colors.textSecondary }]}>
            {t('deleteAccount')}
          </ThemedText>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  // Compact two-column header: avatar | name over email.
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  userEmail: {
    fontSize: Typography.fontSize.sm,
  },
  memberCode: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 36,
    lineHeight: 44,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 6,
    textAlign: 'center',
    marginVertical: Spacing.sm,
  },
  // Stacked full-width: Share (primary) on top, Regenerate below.
  memberCodeActions: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  flexButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  disabled: {
    opacity: 0.5,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.xl,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  cardCompany: {
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    lineHeight: 20,
  },
  packagesContainer: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  packageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderTopWidth: 1,
  },
  packageTitle: {
    fontWeight: Typography.fontWeight.medium,
  },
  packagePrice: {
    fontWeight: Typography.fontWeight.semibold,
  },
  errorText: {
    textAlign: 'center',
  },
  actionsSection: {
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  primaryButton: {},
  primaryButtonText: {
    color: '#fff',
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },
  secondaryButton: {
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  outlineButtonText: {
    fontWeight: Typography.fontWeight.medium,
    fontSize: Typography.fontSize.base,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  deleteLink: {
    alignSelf: 'center',
    marginTop: Spacing['4xl'],
    paddingHorizontal: Spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  deleteLinkText: {
    fontSize: Typography.fontSize.sm,
    textDecorationLine: 'underline',
  },
});
