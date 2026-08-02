import { BorderRadius, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type AllStopsListProps = {
  stops: RoutePoint[];
  currentStopId?: string;
  onStopPress?: (stopId: string) => void;
};

const AllStopsList: React.FC<AllStopsListProps> = ({
  stops,
  currentStopId,
  onStopPress,
}) => {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const pendingStops = stops.filter(stop => stop.status === 'CREATED');
  const completedStops = stops.filter(stop => stop.status === 'VISITED');

  const renderStop = (stop: RoutePoint, index: number) => {
    const isCurrent = stop.id === currentStopId;
    const isCompleted = stop.status === 'VISITED';
    return (
      <View
        key={stop.id}
        style={[
          styles.stopItem,
          isCurrent && styles.currentStop,
          isCompleted && styles.completedStop,
        ]}
      >
        {/* Stop Number & Status Indicator */}
        <View style={styles.stopNumberContainer}>
          {isCompleted ? (
            <View
              style={[
                styles.stopNumber,
                { backgroundColor: colors.success + '20', borderColor: colors.success },
              ]}
            >
              <Ionicons name="checkmark" size={16} color={colors.success} />
            </View>
          ) : (
            <View
              style={[
                styles.stopNumber,
                { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                isCurrent && { backgroundColor: colors.primary + '20', borderColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.stopNumberText,
                  { color: colors.textSecondary },
                  isCurrent && { color: colors.primary },
                ]}
              >
                {stop.index + 1}
              </Text>
            </View>
          )}

          {/* Connecting Line */}
          {index < stops.length - 1 && (
            <View
              style={[
                styles.connectingLine,
                { backgroundColor: isCompleted ? colors.success + '40' : colors.border },
              ]}
            />
          )}
        </View>

        {/* Stop Details */}
        <View style={[styles.stopDetails, { backgroundColor: colors.surface }]}>
          <View style={styles.stopHeader}>
            <Text
              style={[
                styles.stopClientName,
                { color: colors.text },
                isCompleted && { color: colors.textSecondary },
              ]}
            >
              {stop.order.client.name}
            </Text>
            {isCurrent && (
              <View style={[styles.currentBadge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.currentBadgeText, { color: colors.textInverse }]}>{t('currentStop')}</Text>
              </View>
            )}
          </View>

          <Text
            style={[
              styles.stopAddress,
              { color: colors.textSecondary },
            ]}
          >
            {/* Address not available in current structure */}
            Order #{stop.order.number}
          </Text>

          {/* Order Info */}
          <View style={styles.orderInfo}>
            <View style={styles.orderInfoItem}>
              <Ionicons
                name="cube-outline"
                size={14}
                color={isCompleted ? colors.textSecondary : colors.primary}
              />
              <Text
                style={[
                  styles.orderInfoText,
                  { color: colors.text },
                  isCompleted && { color: colors.textSecondary },
                ]}
              >
                {stop.order.items.length} {stop.order.items.length === 1 ? t('item') : t('items')}
              </Text>
            </View>
            <View style={styles.orderInfoItem}>
              <Ionicons
                name="cash-outline"
                size={14}
                color={isCompleted ? colors.textSecondary : colors.primary}
              />
              <Text
                style={[
                  styles.orderInfoText,
                  { color: colors.text },
                  isCompleted && { color: colors.textSecondary },
                ]}
              >
                ${stop.order.pricing.total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Summary Header */}
      <View style={[styles.summaryHeader, { backgroundColor: colors.surface }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: colors.primary }]}>{pendingStops.length}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('pending')}</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text
            style={[
              styles.summaryNumber,
              { color: colors.primary, backgroundColor: colors.success + '20', borderColor: colors.success },
            ]}
          >
            {completedStops.length}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('completed')}</Text>
        </View>
      </View>

      {/* Pending Stops */}
      {pendingStops.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('pending')} {t('stops')}</Text>
          {pendingStops.map((stop, index) => renderStop(stop, index))}
        </View>
      )}

      {/* Completed Stops */}
      {completedStops.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('completed')} {t('stops')}</Text>
          {completedStops.map((stop, index) => renderStop(stop, index))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
  },
  summaryDivider: {
    width: 1,
    height: 40,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  stopItem: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  currentStop: {
    // Additional styling for current stop
  },
  completedStop: {
    opacity: 0.7,
  },
  stopNumberContainer: {
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  stopNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopNumberText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  connectingLine: {
    width: 2,
    flex: 1,
    marginTop: Spacing.xs,
    minHeight: 20,
  },
  stopDetails: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  stopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  stopClientName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
  },
  currentBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  currentBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  stopAddress: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.sm,
  },
  orderInfo: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  orderInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  orderInfoText: {
    fontSize: Typography.fontSize.xs,
  },
});

export default AllStopsList;
