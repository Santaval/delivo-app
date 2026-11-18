import { BorderRadius, Spacing } from '@/constants';
import { useCredits } from '@/context/CreditsContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';

/** Low-balance warning. Renders nothing unless the balance is at or under the threshold. */
export function LowCreditsBanner() {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const { balance, isLow, isBlocked, isInOverdraft, overdraftFloor, canPurchase, isRoleLoading } =
    useCredits();

  if (!isLow || balance === null) return null;

  let color = colors.warning;
  let message = t('creditsLowWarning', { count: balance });
  if (isBlocked) {
    color = colors.danger;
    message = t('creditsBlockedWarning');
  } else if (isInOverdraft) {
    color = colors.danger;
    message = t('creditsOverdraftWarning', { used: -balance, remaining: balance - overdraftFloor });
  }

  return (
    <View
      accessibilityRole="alert"
      style={[styles.container, { backgroundColor: color + '1A', borderColor: color }]}
    >
      <MaterialIcons name="warning-amber" size={20} color={color} />
      <View style={styles.text}>
        <ThemedText style={{ color }}>{message}</ThemedText>
        {!canPurchase && !isRoleLoading && (
          <ThemedText variant="caption">{t('creditsAskAdmin')}</ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginVertical: Spacing.sm,
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
