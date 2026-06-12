import { BorderRadius, Spacing } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { PrimaryButton } from '../PrimaryButton';
import { ThemedText } from '../ThemedText';

export type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
};

export function ErrorState({ message, onRetry, compact = false }: ErrorStateProps) {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const displayMessage = message || t('genericError');

  if (compact) {
    return (
      <View
        style={[
          styles.compactContainer,
          { backgroundColor: colors.backgroundSecondary, borderLeftColor: colors.danger },
        ]}
        accessibilityRole="alert"
      >
        <MaterialIcons name="error-outline" size={20} color={colors.danger} />
        <ThemedText variant="caption" style={styles.compactMessage}>
          {displayMessage}
        </ThemedText>
        {onRetry ? (
          <ThemedText variant="link" onPress={onRetry} accessibilityRole="button">
            {t('retry')}
          </ThemedText>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container} accessibilityRole="alert">
      <MaterialIcons name="error-outline" size={48} color={colors.danger} />
      <ThemedText variant="subtitle" style={styles.title}>
        {displayMessage}
      </ThemedText>
      {onRetry ? (
        <PrimaryButton title={t('retry')} onPress={onRetry} size="medium" style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  title: {
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  action: {
    marginTop: Spacing.md,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 3,
    marginVertical: Spacing.sm,
  },
  compactMessage: {
    flex: 1,
  },
});
