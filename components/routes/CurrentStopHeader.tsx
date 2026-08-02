import { Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

type CurrentStopHeaderProps = {
  clientName: string;
};

const CurrentStopHeader: React.FC<CurrentStopHeaderProps> = ({ clientName }) => {
  const { t } = useTranslation();
  const colors = useThemeColor();
  return (
    <View>
      {/* Current Stop Header */}
      <View style={styles.currentStopHeader}>
        <View style={[styles.stopIndicator, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="location" size={16} color={colors.primary} />
        </View>
        <Text style={[styles.currentStopLabel, { color: colors.primary }]}>{t('currentStopLabel')}</Text>
      </View>

      {/* Client Details */}
      <View style={styles.clientDetails}>
        <Text style={[styles.clientName, { color: colors.text }]}>{clientName}</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  currentStopLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
  },
  clientDetails: {
    marginBottom: Spacing.md,
  },
  clientName: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
});

export default CurrentStopHeader;
