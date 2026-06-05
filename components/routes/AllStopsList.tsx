import { BorderRadius, Colors, Spacing, Typography } from '@/constants';
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
            <View style={[styles.stopNumber, styles.completedNumber]}>
              <Ionicons name="checkmark" size={16} color={Colors.light.success} />
            </View>
          ) : (
            <View style={[styles.stopNumber, isCurrent && styles.currentNumber]}>
              <Text style={[styles.stopNumberText, isCurrent && styles.currentNumberText]}>
                {stop.index + 1}
              </Text>
            </View>
          )}
          
          {/* Connecting Line */}
          {index < stops.length - 1 && (
            <View style={[styles.connectingLine, isCompleted && styles.completedLine]} />
          )}
        </View>

        {/* Stop Details */}
        <View style={styles.stopDetails}>
          <View style={styles.stopHeader}>
            <Text style={[styles.stopClientName, isCompleted && styles.completedText]}>
              {stop.order.client.name}
            </Text>
            {isCurrent && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>{t('currentStop')}</Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.stopAddress, isCompleted && styles.completedText]}>
            {/* Address not available in current structure */}
            Order #{stop.order.number}
          </Text>

          {/* Order Info */}
          <View style={styles.orderInfo}>
            <View style={styles.orderInfoItem}>
              <Ionicons 
                name="cube-outline" 
                size={14} 
                color={isCompleted ? Colors.light.textSecondary : Colors.light.primary} 
              />
              <Text style={[styles.orderInfoText, isCompleted && styles.completedText]}>
                {stop.order.items.length} {stop.order.items.length === 1 ? t('item') : t('items')}
              </Text>
            </View>
            <View style={styles.orderInfoItem}>
              <Ionicons 
                name="cash-outline" 
                size={14} 
                color={isCompleted ? Colors.light.textSecondary : Colors.light.primary} 
              />
              <Text style={[styles.orderInfoText, isCompleted && styles.completedText]}>
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
      <View style={styles.summaryHeader}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{pendingStops.length}</Text>
          <Text style={styles.summaryLabel}>{t('pending')}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, styles.completedNumber]}>
            {completedStops.length}
          </Text>
          <Text style={styles.summaryLabel}>{t('completed')}</Text>
        </View>
      </View>

      {/* Pending Stops */}
      {pendingStops.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('pending')} {t('stops')}</Text>
          {pendingStops.map((stop, index) => renderStop(stop, index))}
        </View>
      )}

      {/* Completed Stops */}
      {completedStops.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('completed')} {t('stops')}</Text>
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
    backgroundColor: Colors.light.surface,
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
    color: Colors.light.primary,
    marginBottom: Spacing.xs,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.light.border,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
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
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentNumber: {
    backgroundColor: Colors.light.primary + '20',
    borderColor: Colors.light.primary,
  },
  completedNumber: {
    backgroundColor: Colors.light.success + '20',
    borderColor: Colors.light.success,
  },
  stopNumberText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.textSecondary,
  },
  currentNumberText: {
    color: Colors.light.primary,
  },
  connectingLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.light.border,
    marginTop: Spacing.xs,
    minHeight: 20,
  },
  completedLine: {
    backgroundColor: Colors.light.success + '40',
  },
  stopDetails: {
    flex: 1,
    backgroundColor: Colors.light.surface,
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
    color: Colors.light.text,
    flex: 1,
  },
  currentBadge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  currentBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.textInverse,
    textTransform: 'uppercase',
  },
  stopAddress: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
  },
  completedText: {
    color: Colors.light.textSecondary,
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
    color: Colors.light.text,
  },
});

export default AllStopsList;
