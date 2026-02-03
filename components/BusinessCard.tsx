import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useColorScheme';
import { BorderRadius, Spacing, Shadows } from '@/constants/Theme';

export type BusinessCardProps = TouchableOpacityProps & {
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'neutral';
  subtitle?: string;
  currency?: string;
  onPress?: () => void;
};

export function BusinessCard({
  title,
  amount,
  type,
  subtitle,
  currency = '$',
  onPress,
  style,
  ...rest
}: BusinessCardProps) {
  const colors = useThemeColor();

  const getAmountColor = () => {
    switch (type) {
      case 'income':
        return colors.success;
      case 'expense':
        return colors.danger;
      default:
        return colors.neutral;
    }
  };

  const formatAmount = (value: number) => {
    const prefix = type === 'expense' ? '-' : type === 'income' ? '+' : '';
    return `${prefix}${currency}${Math.abs(value).toLocaleString()}`;
  };

  const Component = onPress ? TouchableOpacity : ThemedView;

  return (
    <Component
      style={[styles.container, style]}
      onPress={onPress}
      variant="surface"
      {...rest}
    >
      <ThemedView style={styles.content}>
        <ThemedText variant="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText variant="caption" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        )}
        <ThemedText 
          style={[styles.amount, { color: getAmountColor() }]}
        >
          {formatAmount(amount)}
        </ThemedText>
      </ThemedView>
    </Component>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.xs,
    ...Shadows.small,
  },
  content: {
    backgroundColor: 'transparent',
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.md,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
  },
});
