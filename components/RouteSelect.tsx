import { BorderRadius, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks';
import useRoutes from '@/hooks/useRoutes';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteStatus } from './RouteCard';

export type RouteSelectProps = {
  onSelect: (route: Route) => void;
  status: RouteStatus;
  placeholder?: string;
  selectedRoute?: Route | null;
  disabled?: boolean;
};

export default function RouteSelect({
  onSelect,
  status,
  placeholder = 'Select a route',
  selectedRoute,
  disabled = false,
}: RouteSelectProps) {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { routes, loading, error, filterByStatus } = useRoutes();
  const colors = useThemeColor();

  const filteredRoutes = useMemo(() => {
    return filterByStatus(status);
  }, [routes, status, filterByStatus]);

  const handleSelectRoute = (route: Route) => {
    onSelect(route);
    setIsModalVisible(false);
  };

  const getStatusColor = (routeStatus: RouteStatus) => {
    switch (routeStatus) {
      case 'CREATED':
        return colors.warning;
      case 'STARTED':
        return colors.info;
      case 'COMPLETED':
        return colors.success;
      default:
        return colors.textTertiary;
    }
  };

  const getStatusLabel = (routeStatus: RouteStatus) => {
    switch (routeStatus) {
      case 'CREATED':
        return 'Created';
      case 'STARTED':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      default:
        return routeStatus;
    }
  };

  const renderRouteItem = ({ item }: { item: Route }) => (
    <TouchableOpacity
      style={[styles.routeItem, { borderBottomColor: colors.border }]}
      onPress={() => handleSelectRoute(item)}
      activeOpacity={0.7}
    >
      <View style={styles.routeInfo}>
        <Text style={[styles.routeName, { color: colors.text }]}>{item.name}</Text>
        <View style={styles.routeDetails}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status as RouteStatus) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status as RouteStatus) }]}>
              {getStatusLabel(item.status as RouteStatus)}
            </Text>
          </View>
          <Text style={[styles.routeDate, { color: colors.textSecondary }]}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="map-outline" size={48} color={colors.textTertiary} />
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>{t('noRoutesFound')}</Text>
      <Text style={[styles.emptyStateMessage, { color: colors.textSecondary }]}>
        {t('noRoutesWithStatusAvailable', { status: getStatusLabel(status) })}
      </Text>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('loadingRoutes')}</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>{t('failedToLoadRoutes')}</Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>{error}</Text>
        </View>
      );
    }

    if (filteredRoutes.length === 0) {
      return renderEmptyState();
    }

    return (
      <FlatList
        data={filteredRoutes}
        keyExtractor={(item) => item.id}
        renderItem={renderRouteItem}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.selectButton,
          { backgroundColor: colors.background, borderColor: colors.border },
          disabled && [styles.selectButtonDisabled, { backgroundColor: colors.backgroundSecondary }],
          selectedRoute && [styles.selectButtonSelected, { borderColor: colors.primary }],
        ]}
        onPress={() => setIsModalVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.selectButtonContent}>
          {selectedRoute ? (
            <View style={styles.selectedRouteInfo}>
              <Text style={[styles.selectedRouteName, { color: colors.text }]}>{selectedRoute.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedRoute.status as RouteStatus) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(selectedRoute.status as RouteStatus) }]}>
                  {getStatusLabel(selectedRoute.status as RouteStatus)}
                </Text>
              </View>
            </View>
          ) : (
            <Text
              style={[
                styles.placeholderText,
                { color: colors.textSecondary },
                disabled && [styles.placeholderTextDisabled, { color: colors.textTertiary }],
              ]}
            >
              {placeholder}
            </Text>
          )}
        </View>
        <Ionicons
          name="chevron-down"
          size={20}
          color={disabled ? colors.textTertiary : colors.textSecondary}
        />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Route - {getStatusLabel(status)}
            </Text>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            {renderContent()}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 48,
  },
  selectButtonDisabled: {
    opacity: 0.6,
  },
  selectButtonSelected: {},
  selectButtonContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  selectedRouteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  selectedRouteName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
  },
  placeholderText: {
    fontSize: Typography.fontSize.base,
  },
  placeholderTextDisabled: {},
  statusBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.lg,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  modalContent: {
    flex: 1,
  },
  list: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  routeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  routeDate: {
    fontSize: Typography.fontSize.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyStateTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyStateMessage: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    marginTop: Spacing.md,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
});
