import { ThemedText } from '@/components/ThemedText';
import { Routes, Spacing } from '@/constants';
import { useCredits } from '@/context/CreditsContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity } from 'react-native';

/** "Available bills: N" caption for the home header; opens the credit history. */
export function CreditsBalanceLine() {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const { balance, isBlocked, isInOverdraft, isLow } = useCredits();

  if (balance === null) return null;

  const color =
    isBlocked || isInOverdraft ? colors.danger : isLow ? colors.warning : colors.textSecondary;
  const label = t('creditsAvailable', { count: balance });

  return (
    <TouchableOpacity
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={{ top: 8, bottom: 8 }}
      onPress={() => router.push(Routes.creditsHistory)}
    >
      <ThemedText variant="caption" style={{ color }} numberOfLines={1}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    marginTop: Spacing.xs / 2,
  },
});
