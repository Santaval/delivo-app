import DriverSelect, { memberFullName } from '@/components/DriverSelect';
import { BorderRadius, Spacing, Typography } from '@/constants';
import { useRoute } from '@/context/RouteContext';
import { useToast } from '@/context/ToastContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import useCompanyMembers from '@/hooks/useCompanyMembers';
import RoutesService from '@/services/routes/Routes.service';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';

/**
 * Shows the route's driver. OWNER/ADMIN can reassign it while the route is not
 * COMPLETED (the API answers 409 otherwise); anyone else sees it read-only.
 */
export default function RouteDriverSection() {
  const { route, updateRoute } = useRoute();
  const { members, canManageRoutes } = useCompanyMembers();
  const { t } = useTranslation();
  const colors = useThemeColor();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  if (!route) return null;

  const canChange = canManageRoutes && route.status !== 'COMPLETED';
  const driverName = route.driver
    ? memberFullName({ ...route.driver, email: '' })
    : t('unassigned');

  const handleSelect = async (driverId: string | null) => {
    setSaving(true);
    try {
      const updated = await RoutesService.assignDriver(route.id, driverId);
      // Keep the already ordered points; only the driver changed
      updateRoute({ ...route, driverId: updated.driverId, driver: updated.driver, updatedAt: updated.updatedAt });
      toast.show({ message: t('driverUpdated'), type: 'success' });
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        status === 422 ? t('driverNotMember')
        : status === 409 ? t('routeAlreadyCompleted')
        : t('failedToAssignDriver');
      toast.show({ message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.background }]}>
      {canChange ? (
        <DriverSelect
          label={t('assignedDriver')}
          members={members}
          value={route.driverId}
          onSelect={handleSelect}
          allowUnassigned
          disabled={saving}
        />
      ) : (
        <View style={styles.readOnly}>
          <MaterialIcons name="person" size={18} color={colors.textSecondary} />
          <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
            {t('assignedDriver')}:
          </ThemedText>
          <ThemedText style={[styles.name, { color: colors.text }]}>{driverName}</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  readOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  label: { fontSize: Typography.fontSize.sm },
  name: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});
