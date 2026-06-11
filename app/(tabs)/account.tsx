import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors, Spacing, Typography } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { usePurchases } from '@/context/PurchasesContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
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
    Alert.alert(
      restored ? 'Purchases Restored' : 'Nothing to Restore',
      restored
        ? 'Your Delivo Pro subscription has been restored.'
        : 'No previous purchases were found for this account.',
    );
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="person" size={40} color={Colors.light.primary} />
          </View>
          <ThemedText variant="title" style={styles.userName}>
            {user?.name} {user?.surnames}
          </ThemedText>
          <ThemedText variant="caption" style={styles.userEmail}>
            {user?.email}
          </ThemedText>
        </View>

        {/* Subscription Status */}
        <View style={[styles.card, isPro && styles.proCard]}>
          <View style={styles.cardHeader}>
            <MaterialIcons
              name={isPro ? 'star' : 'star-border'}
              size={24}
              color={isPro ? Colors.light.warning : Colors.light.textSecondary}
            />
            <ThemedText variant="subtitle" style={styles.cardTitle}>
              {isPro ? 'Delivo Pro' : 'Free Plan'}
            </ThemedText>
            {isLoading && <ActivityIndicator size="small" color={Colors.light.primary} />}
          </View>

          {isPro ? (
            <ThemedText variant="caption" style={styles.cardDescription}>
              You have full access to all Delivo Pro features.
            </ThemedText>
          ) : (
            <ThemedText variant="caption" style={styles.cardDescription}>
              Upgrade to Delivo Pro to unlock all features.
            </ThemedText>
          )}

          {/* Offerings preview */}
          {!isPro && offerings && (
            <View style={styles.packagesContainer}>
              {offerings.availablePackages.map((pkg) => (
                <View key={pkg.identifier} style={styles.packageRow}>
                  <ThemedText variant="default" style={styles.packageTitle}>
                    {pkg.product.title}
                  </ThemedText>
                  <ThemedText variant="caption" style={styles.packagePrice}>
                    {pkg.product.priceString}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>

        {error && (
          <ThemedText variant="caption" style={styles.errorText}>
            {error}
          </ThemedText>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          {!isPro && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleUpgrade}
              disabled={isLoading}
            >
              <MaterialIcons name="upgrade" size={20} color="#fff" />
              <ThemedText style={styles.primaryButtonText}>
                Upgrade to Delivo Pro
              </ThemedText>
            </TouchableOpacity>
          )}

          {isPro && (
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleManageSubscription}
              disabled={isLoading}
            >
              <MaterialIcons name="manage-accounts" size={20} color={Colors.light.primary} />
              <ThemedText style={styles.secondaryButtonText}>
                Manage Subscription
              </ThemedText>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.outlineButton]}
            onPress={handleRestorePurchases}
            disabled={isLoading}
          >
            <MaterialIcons name="restore" size={20} color={Colors.light.textSecondary} />
            <ThemedText style={styles.outlineButtonText}>
              Restore Purchases
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Sign Out */}
        <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color={Colors.light.danger} />
          <ThemedText style={styles.dangerButtonText}>Sign Out</ThemedText>
        </TouchableOpacity>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingTop: Spacing['4xl'],
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
    backgroundColor: Colors.light.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  userName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  userEmail: {
    color: Colors.light.textSecondary,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: Spacing.sm,
  },
  proCard: {
    borderColor: Colors.light.warning,
    backgroundColor: '#fffbeb',
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
  cardDescription: {
    color: Colors.light.textSecondary,
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
    borderTopColor: Colors.light.border,
  },
  packageTitle: {
    fontWeight: Typography.fontWeight.medium,
  },
  packagePrice: {
    color: Colors.light.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  errorText: {
    color: Colors.light.danger,
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
  primaryButton: {
    backgroundColor: Colors.light.primary,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },
  secondaryButton: {
    backgroundColor: Colors.light.backgroundTertiary,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  secondaryButtonText: {
    color: Colors.light.primary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  outlineButtonText: {
    color: Colors.light.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    fontSize: Typography.fontSize.base,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: Spacing.sm,
  },
  dangerButton: {
    backgroundColor: 'transparent',
  },
  dangerButtonText: {
    color: Colors.light.danger,
    fontWeight: Typography.fontWeight.medium,
    fontSize: Typography.fontSize.base,
  },
});
