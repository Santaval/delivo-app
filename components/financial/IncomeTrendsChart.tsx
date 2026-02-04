import { BorderRadius, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

export type ChartDataPoint = {
  value: number;
  label?: string;
};

export type IncomeTrendsChartProps = {
  title?: string;
  subtitle?: string;
  averageValue?: number;
  data: ChartDataPoint[];
  timeLabels?: string[];
  currency?: string;
  height?: number;
  showGrid?: boolean;
  onPress?: () => void;
};

export function IncomeTrendsChart({
  title = 'Income Trends',
  subtitle = 'Last 30 Days',
  averageValue,
  data,
  timeLabels = ['WEEK 1', 'WEEK 2', 'WEEK 3', 'WEEK 4'],
  currency = '$',
  height = 180,
  showGrid = false,
  onPress = () => console.log('Chart pressed'),
}: IncomeTrendsChartProps) {
  const colors = useThemeColor();
  const { width: screenWidth } = Dimensions.get('window');
  const chartWidth = screenWidth - (Spacing.lg * 4); // Account for card padding
  const chartHeight = height - 80; // Account for header and labels

  // Calculate chart dimensions
  const paddingX = 20;
  const paddingY = 20;
  const plotWidth = chartWidth - (paddingX * 2);
  const plotHeight = chartHeight - (paddingY * 2);

  // Normalize data to chart dimensions
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue || 1;

  const points = data.map((point, index) => {
    const x = paddingX + (index / (data.length - 1)) * plotWidth;
    const y = paddingY + plotHeight - ((point.value - minValue) / valueRange) * plotHeight;
    return { x, y, value: point.value };
  });

  // Generate smooth curve path
  const generateSmoothPath = (points: Array<{ x: number; y: number }>) => {
    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      
      // Simple bezier curve for smooth line
      const controlX1 = prevPoint.x + (currentPoint.x - prevPoint.x) / 3;
      const controlY1 = prevPoint.y;
      const controlX2 = currentPoint.x - (currentPoint.x - prevPoint.x) / 3;
      const controlY2 = currentPoint.y;
      
      path += ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${currentPoint.x} ${currentPoint.y}`;
    }

    return path;
  };

  const formatAverage = (value: number) => {
    return `AVG: ${currency}${value.toLocaleString('en-US')}`;
  };

  return (
    <ThemedView style={[styles.container, { height }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText variant="caption" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        </View>
        {averageValue !== undefined && (
          <ThemedText style={[styles.average, { color: colors.primary }]}>
            {formatAverage(averageValue)}
          </ThemedText>
        )}
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Chart line */}
          <Path
            d={generateSmoothPath(points)}
            stroke={colors.primary}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3"
              fill={colors.primary}
            />
          ))}
        </Svg>

        {/* Week labels */}
        <View style={styles.labelsContainer}>
          {timeLabels.map((label, index) => (
            <ThemedText key={index} variant="caption" style={styles.weekLabel}>
              {label}
            </ThemedText>
          ))}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.xs,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs / 2,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    opacity: 0.7,
  },
  average: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  chartContainer: {
    flex: 1,
    position: 'relative',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  weekLabel: {
    fontSize: Typography.fontSize.xs,
    opacity: 0.6,
    textAlign: 'center',
    flex: 1,
  },
});
