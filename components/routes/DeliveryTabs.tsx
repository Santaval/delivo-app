import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants';

type Tab = 'current' | 'all';

type DeliveryTabsProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

const DeliveryTabs: React.FC<DeliveryTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'current' && styles.activeTab]}
        onPress={() => onTabChange('current')}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>
          Current Location
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'all' && styles.activeTab]}
        onPress={() => onTabChange('all')}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
          All Stops
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.light.backgroundSecondary,
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
    backgroundColor: Colors.light.background,
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
    color: Colors.light.textSecondary,
  },
  activeTabText: {
    color: Colors.light.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
});

export default DeliveryTabs;
export type { Tab };
