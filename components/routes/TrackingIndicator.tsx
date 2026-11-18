import { BorderRadius, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import { useDriverTrackingContext } from '@/hooks/useDriverTracking';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';

/** "Sharing location" banner for the driver, with a pause / resume toggle. */
export default function TrackingIndicator() {
  const { mode, paused, pause, resume } = useDriverTrackingContext();
  const { t } = useTranslation();
  const colors = useThemeColor();

  if (mode === 'off' && !paused) return null;

  const label = paused
    ? t('locationSharingPaused')
    : mode === 'foreground'
      ? t('sharingLocationForeground')
      : t('sharingLocation');
  const tint = paused ? colors.textSecondary : colors.success;

  return (
    <View style={[styles.container, { borderColor: tint + '55', backgroundColor: tint + '15' }]}>
      <MaterialIcons name={paused ? 'location-off' : 'my-location'} size={18} color={tint} />
      <ThemedText style={[styles.label, { color: colors.text }]} numberOfLines={1}>
        {label}
      </ThemedText>
      <Pressable
        onPress={paused ? resume : pause}
        hitSlop={8}
        accessibilityRole="button"
        style={[styles.button, { borderColor: tint }]}
      >
        <ThemedText style={[styles.buttonText, { color: tint }]}>
          {paused ? t('resumeSharing') : t('pauseSharing')}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  label: { flex: 1, fontSize: Typography.fontSize.sm },
  button: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
  },
  buttonText: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold },
});
