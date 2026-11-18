import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Routes, Shadows, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import { canAddOrderToRoute } from '@/utils/orderRouting';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type OrderRouteCardProps = {
  order: Order;
  onAddToRoute: () => void;
  disabled?: boolean;
};

/**
 * Order detail card for delivery routing: shows the route the order is on
 * (tap to open it), or an "Add to route" action when the order can join one.
 * Renders nothing otherwise (e.g. delivered without a route).
 */
export default function OrderRouteCard({ order, onAddToRoute, disabled }: OrderRouteCardProps) {
  const colors = useThemeColor();
  const { t } = useTranslation();

  if (order.route) {
    const route = order.route;
    const statusLabel =
      route.status === 'STARTED' ? t('inProgress') : route.status === 'COMPLETED' ? t('completed') : t('created');
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface }]}
        onPress={() => router.push(Routes.routeView(route.id))}
        accessibilityRole="button"
        accessibilityLabel={`${t('route')}: ${route.name}, ${statusLabel}`}
      >
        <View style={[styles.icon, { backgroundColor: colors.backgroundTertiary }]}>
          <MaterialIcons name="map" size={20} color={colors.primary} />
        </View>
        <View style={styles.text}>
          <ThemedText style={[styles.caption, { color: colors.textSecondary }]}>{t('route')}</ThemedText>
          <ThemedText style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {route.name}
          </ThemedText>
        </View>
        <ThemedText style={[styles.status, { color: colors.textSecondary }]}>{statusLabel}</ThemedText>
        <MaterialIcons name="chevron-right" size={22} color={colors.textTertiary} />
      </TouchableOpacity>
    );
  }

  if (!canAddOrderToRoute(order)) return null;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }, disabled && styles.disabled]}
      onPress={onAddToRoute}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <View style={[styles.icon, { backgroundColor: colors.backgroundTertiary }]}>
        <MaterialIcons name="add-road" size={20} color={colors.primary} />
      </View>
      <View style={styles.text}>
        <ThemedText style={[styles.name, { color: colors.primary }]}>{t('addToRoute')}</ThemedText>
        <ThemedText style={[styles.caption, { color: colors.textSecondary }]}>{t('addToRouteHint')}</ThemedText>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 64,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    flex: 1,
  },
  caption: {
    fontSize: Typography.fontSize.sm,
  },
  name: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  status: {
    fontSize: Typography.fontSize.sm,
  },
});
