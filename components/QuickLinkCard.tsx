import { BorderRadius, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export type QuickLinkCardProps = {
  title: string;
  subtitle: string;
  icon: React.ReactNode; // Using emoji for now, can be replaced with actual icons later
  iconColor?: string;
  onPress?: () => void;
  showChevron?: boolean;
};

export function QuickLinkCard({
  title,
  subtitle,
  icon,
  iconColor,
  onPress = () => console.log(`${title} pressed`),
  showChevron = true,
}: QuickLinkCardProps) {
  const colors = useThemeColor();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ThemedView style={styles.content}>
        {/* Icon */}
        <View style={[
          styles.iconContainer,
          { backgroundColor: iconColor || colors.primary }
        ]}>
          <ThemedText style={styles.icon}>
            {icon}
          </ThemedText>
        </View>

        {/* Content */}
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText variant="caption" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        </View>

        {/* Chevron */}
        {showChevron && (
          <View style={styles.chevronContainer}>
            <ThemedText style={[styles.chevron, { color: colors.textSecondary }]}>
              ›
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'transparent',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 20,
    color: '#ffffff',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs / 2,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    opacity: 0.7,
  },
  chevronContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
  },
  chevron: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.medium,
  },
});
