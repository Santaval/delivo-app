import { ThemedText } from '@/components/ThemedText';
import { TopBar } from '@/components/TopBar';
import { Spacing, Typography } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useCompanies } from '@/context/CompaniesContext';
import { usePurchases } from '@/context/PurchasesContext';
import { useToast } from '@/context/ToastContext';
import { useDrawer } from '@/hooks';
import { useThemeColor } from '@/hooks/useColorScheme';
import { confirmDestructive } from '@/utils/confirm';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const { activeCompany } = useCompanies();
  const { t } = useTranslation();
  const toast = useToast();
  const colors = useThemeColor();
  const { openDrawer } = useDrawer();
  const {
    isPro,
    isLoading,
    error,
    offerings,
    presentPaywall,
    presentCustomerCenter,
    restorePurchases,
  } = usePurchases();

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
      <TopBar title={t('account')} onMenuPress={openDrawer} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.backgroundTertiary }]}>
            <MaterialIcons name="person" size={40} color={colors.primary} />
          </View>
          <ThemedText variant="title" style={styles.userName}>
            {user?.name} {user?.surnames}
          </ThemedText>
          <ThemedText variant="caption" style={[styles.userEmail, { color: colors.textSecondary }]}>
            {user?.email}
          </ThemedText>
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

        {/* Sign Out */}
        <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color={colors.danger} />
          <ThemedText style={[styles.dangerButtonText, { color: colors.danger }]}>{t('signOut')}</ThemedText>
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
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  userName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  userEmail: {},
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
  dangerButton: {
    backgroundColor: 'transparent',
  },
  dangerButtonText: {
    fontWeight: Typography.fontWeight.medium,
    fontSize: Typography.fontSize.base,
  },
});
