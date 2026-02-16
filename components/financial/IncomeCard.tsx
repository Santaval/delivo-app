import { BorderRadius, Shadows, Spacing } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import CurrencyText from '../currency/CurrencyText';

export type IncomeCardProps = {
  title: string;
  amount: number;
  percentage?: number;
  timeStamp?: string;
  variant?: 'light' | 'default';
  onPress?: () => void;
};

export function IncomeCard({
  title,
  amount,
  percentage,
  timeStamp,
  variant = 'light',
  onPress = () => console.log('Income card pressed'),
}: IncomeCardProps) {
  const colors = useThemeColor();

  const getCardStyles = () => {
    switch (variant) {
      case 'light':
        return {
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
          borderWidth: 1,
        };
      case 'default':
        return {
          backgroundColor: colors.surface,
          borderColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: colors.surface,
          borderColor: 'transparent',
          borderWidth: 0,
        };
    }
  };


  const formatPercentage = (value?: number) => {
    if (value === undefined) return null;
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getPercentageColor = () => {
    if (percentage === undefined) return colors.textSecondary;
    return percentage >= 0 ? colors.success : colors.danger;
  };

  return (
    <ThemedView
      style={[
        styles.container,
        getCardStyles(),
      ]}
    >
      <View style={styles.header}>
        <ThemedText variant="caption" style={styles.title}>
          {title.toUpperCase()}
        </ThemedText>
        {percentage !== undefined && (
          <View style={styles.percentageContainer}>
            <ThemedText
              style={[
                styles.percentage,
                { color: getPercentageColor() }
              ]}
            >
              {formatPercentage(percentage)}
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.amountSection}>
        <CurrencyText style={styles.amount} amount={amount} />
      </View>

      {timeStamp && (
        <View style={styles.footer}>
          <ThemedText variant="caption" style={styles.timeStamp}>
            {timeStamp}
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.xs,
    ...Shadows.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentage: {
    fontSize: 12,
    fontWeight: '600',
  },
  amountSection: {
    marginBottom: Spacing.sm,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  footer: {
    marginTop: Spacing.xs,
  },
  timeStamp: {
    fontSize: 11,
    opacity: 0.7,
  },
});
