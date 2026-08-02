import { BorderRadius, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
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
  const colors = useThemeColor();
  return (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={[styles.actionButton, { borderColor: colors.border, backgroundColor: colors.background }]}
        onPress={onCall}
      >
        <Ionicons name="call" size={20} color={colors.primary} />
        <Text style={[styles.actionButtonText, { color: colors.primary }]}>{t('call')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.actionButton,
          { backgroundColor: colors.primary, borderColor: colors.primary },
        ]}
        onPress={onOpenGPS}
      >
        <Ionicons name="navigate" size={20} color={colors.textInverse} />
        <Text style={[styles.actionButtonText, { color: colors.textInverse }]}>
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
  },
  actionButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: Spacing.xs,
  },
});

export default DeliveryActionButtons;
