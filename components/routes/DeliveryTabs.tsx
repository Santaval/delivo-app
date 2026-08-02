import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { BorderRadius, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';

type Tab = 'current' | 'all';

type DeliveryTabsProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

const DeliveryTabs: React.FC<DeliveryTabsProps> = ({ activeTab, onTabChange }) => {
  const colors = useThemeColor();
  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'current' && [styles.activeTab, { backgroundColor: colors.background }]]}
        onPress={() => onTabChange('current')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.tabText,
            { color: colors.textSecondary },
            activeTab === 'current' && [styles.activeTabText, { color: colors.primary }],
          ]}
        >
          Current Location
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'all' && [styles.activeTab, { backgroundColor: colors.background }]]}
        onPress={() => onTabChange('all')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.tabText,
            { color: colors.textSecondary },
            activeTab === 'all' && [styles.activeTabText, { color: colors.primary }],
          ]}
        >
          All Stops
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  activeTabText: {
    fontWeight: Typography.fontWeight.semibold,
  },
});

export default DeliveryTabs;
export type { Tab };
