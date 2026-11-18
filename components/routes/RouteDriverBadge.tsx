import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants';
import { useRoute } from '@/context/RouteContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

function initials(name: string, surnames: string) {
  return `${name.trim().charAt(0)}${surnames.trim().charAt(0)}`.toUpperCase() || '?';
}

/**
 * Compact, read-only driver indicator for the started route's map (top right):
 * initials avatar + first name. Replaces the full RouteDriverSection there —
 * reassigning stays available while planning.
 */
export default function RouteDriverBadge() {
  const { route } = useRoute();
  const colors = useThemeColor();
  const { t } = useTranslation();

  if (!route) return null;
  const driver = route.driver;
  const label = driver ? driver.name.trim().split(/\s+/)[0] : t('unassigned');
  const fullLabel = driver
    ? `${t('assignedDriver')}: ${`${driver.name} ${driver.surnames}`.trim()}`
    : `${t('assignedDriver')}: ${t('unassigned')}`;

  return (
    <View
      style={[styles.container, { backgroundColor: colors.surface }]}
      accessible
      accessibilityLabel={fullLabel}
    >
      <View style={[styles.avatar, { backgroundColor: driver ? colors.primary : colors.backgroundTertiary }]}>
        {driver ? (
          <ThemedText style={[styles.initials, { color: colors.textInverse }]}>
            {initials(driver.name, driver.surnames)}
          </ThemedText>
        ) : (
          <MaterialIcons name="person-off" size={16} color={colors.textSecondary} />
        )}
      </View>
      <ThemedText style={[styles.name, { color: colors.text }]} numberOfLines={1}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    height: 44,
    maxWidth: 160,
    paddingLeft: 6,
    paddingRight: Spacing.md,
    borderRadius: BorderRadius.full,
    ...Shadows.medium,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  name: {
    flexShrink: 1,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
});
