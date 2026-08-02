import { BorderRadius, Shadows, Spacing } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SkeletonBox } from './feedback/Skeleton';

export function OrderCardSkeleton() {
  const colors = useThemeColor();
  const shimmerColor = colors.backgroundSecondary;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <SkeletonBox style={[styles.badge, { backgroundColor: shimmerColor }]} />
          <View style={styles.orderInfo}>
            <SkeletonBox style={[styles.lineWide, { backgroundColor: shimmerColor }]} />
            <SkeletonBox style={[styles.lineMedium, { backgroundColor: shimmerColor }]} />
            <SkeletonBox style={[styles.lineNarrow, { backgroundColor: shimmerColor }]} />
          </View>
        </View>
        <View style={styles.rightSection}>
          <SkeletonBox style={[styles.amount, { backgroundColor: shimmerColor }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.xs,
    ...Shadows.small,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  leftSection: {
    flex: 1,
    gap: Spacing.sm,
  },
  badge: {
    width: 80,
    height: 22,
    borderRadius: BorderRadius.full,
  },
  orderInfo: {
    gap: 6,
  },
  lineWide: {
    width: '70%',
    height: 14,
    borderRadius: BorderRadius.sm,
  },
  lineMedium: {
    width: '50%',
    height: 12,
    borderRadius: BorderRadius.sm,
  },
  lineNarrow: {
    width: '40%',
    height: 12,
    borderRadius: BorderRadius.sm,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    width: 64,
    height: 18,
    borderRadius: BorderRadius.sm,
  },
});
