import { BorderRadius, Colors, Spacing, Typography } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type DeliveryActionButtonsProps = {
  onCall: () => void;
  onOpenGPS: () => void;
};

const DeliveryActionButtons: React.FC<DeliveryActionButtonsProps> = ({
  onCall,
  onOpenGPS,
}) => {
  const { t } = useTranslation();
  return (
    <View style={styles.actionButtons}>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={onCall}
      >
        <Ionicons name="call" size={20} color={Colors.light.primary} />
        <Text style={styles.actionButtonText}>{t('call')}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionButton, styles.primaryActionButton]}
        onPress={onOpenGPS}
      >
        <Ionicons name="navigate" size={20} color={Colors.light.textInverse} />
        <Text style={[styles.actionButtonText, styles.primaryActionButtonText]}>
          {t('openGPS')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  primaryActionButton: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.primary,
    marginLeft: Spacing.xs,
  },
  primaryActionButtonText: {
    color: Colors.light.textInverse,
  },
});

export default DeliveryActionButtons;
