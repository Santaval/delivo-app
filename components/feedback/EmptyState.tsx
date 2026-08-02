import { Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PrimaryButton } from '../PrimaryButton';
import { ThemedText } from '../ThemedText';

export type EmptyStateProps = {
  icon?: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon = 'inbox',
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const colors = useThemeColor();

  return (
    <View style={styles.container}>
      <MaterialIcons name={icon} size={48} color={colors.textTertiary} />
      <ThemedText variant="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      {subtitle ? (
        <ThemedText variant="caption" style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      ) : null}
      {actionLabel && onAction ? (
        <PrimaryButton
          title={actionLabel}
          onPress={onAction}
          size="medium"
          style={styles.action}
        />
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
  subtitle: {
    textAlign: 'center',
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  action: {
    marginTop: Spacing.md,
  },
});
