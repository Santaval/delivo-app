import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export type RouteStatus = 'CREATED' | 'STARTED' | 'COMPLETED';

export type RouteCardProps = {
  route: Route;
  onPress?: (routeId: string) => void;
  onDetailsPress?: (routeId: string) => void;
};

export function RouteCard({ route, onPress, onDetailsPress }: RouteCardProps) {
  const colors = useThemeColor();
  const { t } = useTranslation(); 

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return t("today");
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).toUpperCase();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getStatusConfig = (status: RouteStatus) => {
    switch (status) {
      case 'CREATED':
        return {
          label: t("created"),
          backgroundColor: Colors.light.textTertiary + '20',
          textColor: Colors.light.textTertiary,
        };
      case 'STARTED':
        return {
          label: t("inProgress"),
          backgroundColor: Colors.light.primary + '20',
          textColor: Colors.light.primary,
        };
      case 'COMPLETED':
        return {
          label: t("completed"),
          backgroundColor: Colors.light.success + '20',
          textColor: Colors.light.success,
        };
      default:
        return {
          label: 'UNKNOWN',
          backgroundColor: Colors.light.textTertiary + '20',
          textColor: Colors.light.textTertiary,
        };
    }
  };

  const getCompletedStops = () => {
    const completedCount = route.points.filter(point => point.status === 'VISITED').length;
    return completedCount;
  };

  const getProgressPercentage = () => {
    const completed = getCompletedStops();
    const total = route.points.length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  // Calculate ETA based on route status and points
  const getEstimatedTime = () => {
    // This is a simplified calculation - in reality you'd use more complex logic
    const now = new Date();
    const estimatedHours = route.points.length * 0.5; // 30 minutes per stop
    const eta = new Date(now.getTime() + estimatedHours * 60 * 60 * 1000);
    return formatTime(eta.toISOString());
  };

  const statusConfig = getStatusConfig(route.status as RouteStatus);
  const completedStops = getCompletedStops();
  const totalStops = route.points.length;
  const progressPercentage = getProgressPercentage();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress && onPress(route.id)}
      activeOpacity={0.8}
    >
      <ThemedView style={[styles.card, { backgroundColor: colors.surface }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.routeInfo}>
            <ThemedText style={[styles.routeNumber, { color: colors.primary }]}>
              #{route.name}
            </ThemedText>
            <View style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.backgroundColor }
            ]}>
              <ThemedText style={[
                styles.statusText,
                { color: statusConfig.textColor }
              ]}>
                {statusConfig.label}
              </ThemedText>
            </View>
          </View>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {/* Handle menu */}}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="more-horiz"
              size={20}
              color={colors.textSecondary || Colors.light.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Date */}
        <View style={styles.dateRow}>
          <ThemedText style={styles.dateText}>
            {formatDate(route.createdAt)} • {formatDate(route.createdAt).includes('TODAY') ? formatTime(route.createdAt) : formatTime(route.createdAt)}
          </ThemedText>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <ThemedText style={styles.stopsText}>
              {totalStops} Stops Total
            </ThemedText>
            <ThemedText style={[styles.progressText, { color: colors.primary }]}>
              {completedStops}/{totalStops} Done
            </ThemedText>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
              <View style={[
                styles.progressBarFill,
                { 
                  backgroundColor: colors.primary,
                  width: `${progressPercentage}%` 
                }
              ]} />
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.etaSection}>
            <MaterialIcons
              name="schedule"
              size={16}
              color={colors.textSecondary || Colors.light.textSecondary}
            />
            <ThemedText style={styles.etaText}>
              ETA: {getEstimatedTime()}
            </ThemedText>
          </View>

          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => onDetailsPress && onDetailsPress(route.id)}
            activeOpacity={0.7}
          >
            <ThemedText style={[styles.detailsText, { color: colors.primary }]}>
              Details
            </ThemedText>
            <MaterialIcons
              name="chevron-right"
              size={16}
              color={colors.primary || Colors.light.primary}
            />
          </TouchableOpacity>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  routeNumber: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuButton: {
    padding: Spacing.xs,
  },
  dateRow: {
    marginBottom: Spacing.md,
  },
  dateText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  progressSection: {
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  stopsText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  progressText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  progressBarContainer: {
    marginTop: Spacing.xs,
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  etaText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  detailsText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
});
