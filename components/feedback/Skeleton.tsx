import { BorderRadius, Shadows, Spacing } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export function SkeletonBox({ style }: { style?: object }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[style, animatedStyle]} />;
}

export function GenericCardSkeleton() {
  const colors = useThemeColor();
  const shimmerColor = colors.backgroundSecondary;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <SkeletonBox style={[styles.lineWide, { backgroundColor: shimmerColor }]} />
          <SkeletonBox style={[styles.lineMedium, { backgroundColor: shimmerColor }]} />
        </View>
        <View style={styles.rightSection}>
          <SkeletonBox style={[styles.amount, { backgroundColor: shimmerColor }]} />
        </View>
      </View>
    </View>
  );
}

export type ListSkeletonProps = {
  count?: number;
  Row?: React.ComponentType;
};

export function ListSkeleton({ count = 6, Row = GenericCardSkeleton }: ListSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Row key={i} />
      ))}
    </>
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
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    width: 64,
    height: 18,
    borderRadius: BorderRadius.sm,
  },
});
