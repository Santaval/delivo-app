import { PrimaryButton } from '@/components/PrimaryButton';
import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Routes, Shadows, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import useRoutes from '@/hooks/useRoutes';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AddToRouteModalProps = {
  onClose: () => void;
  onSelect: (routeId: string) => void;
};

/**
 * Bottom sheet listing the routes an order can be added to. Only routes that
 * haven't started (`CREATED`) accept new stops. Mount it only while open: it
 * fetches the routes on mount.
 */
export default function AddToRouteModal({ onClose, onSelect }: AddToRouteModalProps) {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { routes, loading, error, refresh } = useRoutes();

  const openRoutes = routes.filter((route) => route.status === 'CREATED');

  const handleCreateRoute = () => {
    onClose();
    router.push(Routes.routesCreate);
  };

  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.center}>
          <ThemedText style={{ color: colors.danger }}>{error}</ThemedText>
          <PrimaryButton title={t('tryAgain')} variant="outline" onPress={refresh} />
        </View>
      );
    }
    if (openRoutes.length === 0) {
      return (
        <View style={styles.center}>
          <MaterialIcons name="alt-route" size={36} color={colors.textTertiary} />
          <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>{t('noOpenRoutes')}</ThemedText>
          <ThemedText style={[styles.emptyHint, { color: colors.textSecondary }]}>
            {t('noOpenRoutesHint')}
          </ThemedText>
          <PrimaryButton title={t('createRoute')} onPress={handleCreateRoute} />
        </View>
      );
    }
    return (
      <FlatList
        data={openRoutes}
        keyExtractor={(route) => route.id}
        style={styles.list}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => onSelect(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`${t('addToRoute')}: ${item.name}`}
          >
            <View style={[styles.rowIcon, { backgroundColor: colors.backgroundTertiary }]}>
              <MaterialIcons name="map" size={20} color={colors.primary} />
            </View>
            <View style={styles.rowText}>
              <ThemedText style={[styles.rowName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <ThemedText style={[styles.rowMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                {t('stopsCount', { count: item.points?.length ?? 0 })}
                {item.driver ? ` · ${item.driver.name}` : ''}
              </ThemedText>
            </View>
            <MaterialIcons name="add-circle-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      />
    );
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} style={styles.overlay} onPress={onClose}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.sheet,
            { backgroundColor: colors.surface, paddingBottom: Spacing.xl + insets.bottom },
          ]}
        >
          <View style={styles.header}>
            <ThemedText style={[styles.title, { color: colors.text }]}>{t('chooseRoute')}</ThemedText>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('close')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          {renderBody()}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxHeight: '75%',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    elevation: 8,
    ...(Platform.OS === 'ios' ? Shadows.large : {}),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  center: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  emptyHint: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  list: {
    flexGrow: 0,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 56,
    paddingVertical: Spacing.sm,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  rowMeta: {
    fontSize: Typography.fontSize.sm,
  },
});
