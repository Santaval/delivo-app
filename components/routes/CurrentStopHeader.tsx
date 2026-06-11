import { Colors, Spacing, Typography } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

type CurrentStopHeaderProps = {
  clientName: string;
};

const CurrentStopHeader: React.FC<CurrentStopHeaderProps> = ({ clientName }) => {
  const { t } = useTranslation();
  return (
    <View>
      {/* Current Stop Header */}
      <View style={styles.currentStopHeader}>
        <View style={styles.stopIndicator}>
          <Ionicons name="location" size={16} color={Colors.light.primary} />
        </View>
        <Text style={styles.currentStopLabel}>{t('currentStopLabel')}</Text>
      </View>

      {/* Client Details */}
      <View style={styles.clientDetails}>
        <Text style={styles.clientName}>{clientName}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  currentStopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stopIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  currentStopLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.primary,
    letterSpacing: 1,
  },
  clientDetails: {
    marginBottom: Spacing.md,
  },
  clientName: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
});

export default CurrentStopHeader;
