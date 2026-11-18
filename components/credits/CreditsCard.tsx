import { BorderRadius, Routes, Spacing, Typography } from '@/constants';
import { useCompanies } from '@/context/CompaniesContext';
import { useCredits } from '@/context/CreditsContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { PrimaryButton } from '../PrimaryButton';
import { ThemedText } from '../ThemedText';

/** Account screen card: bill balance of the active company and a link to the history. */
export function CreditsCard() {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const { activeCompany } = useCompanies();
  const { balance, isLoading, canPurchase, isRoleLoading } = useCredits();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <MaterialIcons name="receipt-long" size={24} color={colors.primary} />
        <ThemedText variant="subtitle" style={styles.title}>
          {t('creditsTitle')}
        </ThemedText>
        {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
      </View>

      {balance !== null && (
        <ThemedText style={styles.balance}>{balance}</ThemedText>
      )}
      {activeCompany && (
        <ThemedText variant="caption">
          {t('creditsBalanceFor', { company: activeCompany.name })}
        </ThemedText>
      )}

      <PrimaryButton
        title={t('creditsViewHistory')}
        variant="outline"
        onPress={() => router.push(Routes.creditsHistory)}
        style={styles.button}
      />

      {!canPurchase && !isRoleLoading && (
        <ThemedText variant="caption">{t('creditsAskAdmin')}</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
  },
  balance: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: Typography.fontWeight.bold,
  },
  button: {
    marginTop: Spacing.sm,
  },
});
